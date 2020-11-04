import request from 'supertest';
import { when } from 'jest-when';
import app from '../../../app';
import { sendHealthRecordRequest } from '../../../services/gp2gp';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../../services/database/deduction-request-repository';
import { Status } from '../../../models/DeductionRequest';

jest.mock('../../../middleware/auth');
jest.mock('../../../middleware/logging');
jest.mock('../../../services/gp2gp/health-record-request', () => ({
  sendHealthRecordRequest: jest.fn()
}));
jest.mock('../../../services/database/deduction-request-repository', () => ({
  getDeductionRequestByConversationId: jest.fn(),
  updateDeductionRequestStatus: jest.fn()
}));

const expectedNhsNumber = '1234567891';
const odsCode = 'Y4321';

describe('PATCH /deduction-requests/:conversationId/pds-update', () => {
  const conversationId = 'b3e0cfe6-7401-4ced-b5b3-34862d602c28';

  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key';
  });

  it('should call sendHealthRecordRequest with nhs number and return a 204', done => {
    when(getDeductionRequestByConversationId).calledWith(conversationId).mockResolvedValue({
      nhs_number: expectedNhsNumber,
      ods_code: odsCode,
      status: Status.PDS_UPDATE_SENT
    });
    sendHealthRecordRequest.mockResolvedValue({ status: 204 });

    request(app)
      .patch(`/deduction-requests/${conversationId}/pds-update`)
      .expect(() => {
        expect(getDeductionRequestByConversationId).toHaveBeenCalledWith(conversationId);
        expect(updateDeductionRequestStatus).toHaveBeenCalledWith(
          conversationId,
          Status.PDS_UPDATED
        );
        expect(sendHealthRecordRequest).toHaveBeenCalledWith(
          expectedNhsNumber,
          conversationId,
          odsCode
        );
        expect(updateLogEvent).toHaveBeenCalledWith({ status: 'Ehr request sent' });
      })
      .expect(204)
      .end(done);
  });

  it('should return an error if :conversationId is not valid', done => {
    const errorMessage = [{ conversationId: "'conversationId' provided is not of type UUIDv4" }];
    const invalidConversationId = '12345';

    request(app)
      .patch(`/deduction-requests/${invalidConversationId}/pds-update`)
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
      })
      .end(done);
  });

  [Status.PDS_UPDATED, Status.EHR_REQUEST_SENT, Status.EHR_REQUEST_RECEIVED].forEach(status => {
    it(`should not call sendHealthRecordRequest with nhs number and return a 204 for status: ${status}`, done => {
      when(getDeductionRequestByConversationId)
        .calledWith(conversationId)
        .mockResolvedValue({ nhs_number: expectedNhsNumber, ods_code: odsCode, status: status });

      request(app)
        .patch(`/deduction-requests/${conversationId}/pds-update`)
        .expect(() => {
          expect(getDeductionRequestByConversationId).toHaveBeenCalledWith(conversationId);
          expect(updateDeductionRequestStatus).not.toHaveBeenCalled();
          expect(sendHealthRecordRequest).not.toHaveBeenCalled();
        })
        .expect(204)
        .end(done);
    });
  });

  it('should update the deduction status again after sending the health record request', done => {
    when(getDeductionRequestByConversationId).calledWith(conversationId).mockResolvedValue({
      nhs_number: expectedNhsNumber,
      ods_code: odsCode,
      status: Status.PDS_UPDATE_SENT
    });
    request(app)
      .patch(`/deduction-requests/${conversationId}/pds-update`)
      .expect(() => {
        expect(updateDeductionRequestStatus).toHaveBeenCalledWith(
          conversationId,
          Status.PDS_UPDATED
        );
        expect(sendHealthRecordRequest).toHaveBeenCalledWith(
          expectedNhsNumber,
          conversationId,
          odsCode
        );
        expect(updateDeductionRequestStatus).toHaveBeenCalledWith(
          conversationId,
          Status.EHR_REQUEST_SENT
        );
      })
      .expect(204)
      .end(done);
  });

  it('should not update the deduction status when sending the health record request fails', done => {
    when(getDeductionRequestByConversationId).calledWith(conversationId).mockResolvedValue({
      nhs_number: expectedNhsNumber,
      ods_code: odsCode,
      status: Status.PDS_UPDATE_SENT
    });
    sendHealthRecordRequest.mockResolvedValue({ status: 503 });

    request(app)
      .patch(`/deduction-requests/${conversationId}/pds-update`)
      .expect(() => {
        expect(updateDeductionRequestStatus).toHaveBeenCalledWith(
          conversationId,
          Status.PDS_UPDATED
        );
        expect(sendHealthRecordRequest).toHaveBeenCalled();
        expect(updateDeductionRequestStatus).not.toHaveBeenCalledWith(
          conversationId,
          Status.EHR_REQUEST_SENT
        );
        expect(updateLogEventWithError).toHaveBeenCalled();
      })
      .expect(503)
      .end(done);
  });

  it('should return a 503 when sending health record request fails', done => {
    when(getDeductionRequestByConversationId).calledWith(conversationId).mockResolvedValue({
      nhs_number: expectedNhsNumber,
      ods_code: odsCode,
      status: Status.PDS_UPDATE_SENT
    });
    sendHealthRecordRequest.mockRejectedValue({ errors: ['error'] });
    request(app).patch(`/deduction-requests/${conversationId}/pds-update`).expect(503).end(done);
  });

  it('should not send the health record request when the deduction request status update fails', done => {
    when(getDeductionRequestByConversationId).calledWith(conversationId).mockResolvedValue({
      nhs_number: expectedNhsNumber,
      ods_code: odsCode,
      status: Status.PDS_UPDATE_SENT
    });
    when(updateDeductionRequestStatus).calledWith(conversationId).mockRejectedValue({});

    request(app)
      .patch(`/deduction-requests/${conversationId}/pds-update`)
      .expect(() => {
        expect(getDeductionRequestByConversationId).toHaveBeenCalledWith(conversationId);
        expect(updateDeductionRequestStatus).toHaveBeenCalledWith(
          conversationId,
          Status.PDS_UPDATED
        );
        expect(sendHealthRecordRequest).not.toHaveBeenCalled();
      })
      .expect(503)
      .end(done);
  });

  it('should return a 409 if the deduction request status equals started', done => {
    when(getDeductionRequestByConversationId).calledWith(conversationId).mockResolvedValue({
      nhs_number: expectedNhsNumber,
      ods_code: odsCode,
      status: Status.STARTED
    });
    request(app)
      .patch(`/deduction-requests/${conversationId}/pds-update`)
      .expect(() => {
        expect(updateDeductionRequestStatus).not.toHaveBeenCalled();
        expect(sendHealthRecordRequest).not.toHaveBeenCalled();
        expect(updateLogEvent).toHaveBeenCalledWith({
          status: 'Pds update has not been requested'
        });
      })
      .expect(409)
      .end(done);
  });

  it('should return a 404 when conversation id not found', done => {
    const nonexistentConversationId = '1017bc7e-d8c0-49c2-99d6-67672cf408cd';
    when(getDeductionRequestByConversationId)
      .calledWith(nonexistentConversationId)
      .mockResolvedValue(null);
    request(app)
      .patch(`/deduction-requests/${nonexistentConversationId}/pds-update`)
      .expect(404)
      .expect(() => {
        expect(getDeductionRequestByConversationId).toHaveBeenCalledWith(nonexistentConversationId);
        expect(updateDeductionRequestStatus).not.toHaveBeenCalled();
        expect(sendHealthRecordRequest).not.toHaveBeenCalled();
        expect(updateLogEvent).toHaveBeenCalledWith({
          status: 'Conversation id not found'
        });
      })
      .end(done);
  });
});
