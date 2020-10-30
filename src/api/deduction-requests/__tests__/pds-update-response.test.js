import request from 'supertest';
import { when } from 'jest-when';
import app from '../../../app';
import { sendHealthRecordRequest } from '../../../services/gp2gp';
import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../../services/database/deduction-request-repository';

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

describe('PATCH /deduction-requests/:conversationId/pds-update', () => {
  const conversationId = 'b3e0cfe6-7401-4ced-b5b3-34862d602c28';

  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key';
  });

  it('should call sendHealthRecordRequest with nhs number and return a 204', done => {
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhs_number: expectedNhsNumber, status: 'pds_update_sent' });

    request(app)
      .patch(`/deduction-requests/${conversationId}/pds-update`)
      .expect(() => {
        expect(getDeductionRequestByConversationId).toHaveBeenCalledWith(conversationId);
        expect(updateDeductionRequestStatus).toHaveBeenCalledWith(conversationId);
        expect(sendHealthRecordRequest).toHaveBeenCalledWith(expectedNhsNumber);
      })
      .expect(204)
      .end(done);
  });

  ['pds_updated', 'ehr_request_sent', 'ehr_extract_received', 'failed'].forEach(status => {
    it(`should not call sendHealthRecordRequest with nhs number and return a 204 for status: ${status}`, done => {
      when(getDeductionRequestByConversationId)
        .calledWith(conversationId)
        .mockResolvedValue({ nhs_number: expectedNhsNumber, status: status });

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

  it('should return a 503 when sending health record request fails', done => {
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhs_number: expectedNhsNumber, status: 'pds_update_sent' });
    sendHealthRecordRequest.mockRejectedValue({ errors: ['error'] });
    request(app).patch(`/deduction-requests/${conversationId}/pds-update`).expect(503).end(done);
  });

  it('should return a 409 if the deduction request status equals started', done => {
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhs_number: expectedNhsNumber, status: 'started' });
    request(app)
      .patch(`/deduction-requests/${conversationId}/pds-update`)
      .expect(() => {
        expect(updateDeductionRequestStatus).not.toHaveBeenCalled();
        expect(sendHealthRecordRequest).not.toHaveBeenCalled();
      })
      .expect(409)
      .end(done);
  });

  it('should not send the health record request when the deduction request status update fails', done => {
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhs_number: expectedNhsNumber, status: 'pds_update_sent' });
    when(updateDeductionRequestStatus).calledWith(conversationId).mockRejectedValue({});

    request(app)
      .patch(`/deduction-requests/${conversationId}/pds-update`)
      .expect(() => {
        expect(getDeductionRequestByConversationId).toHaveBeenCalledWith(conversationId);
        expect(updateDeductionRequestStatus).toHaveBeenCalledWith(conversationId);
        expect(sendHealthRecordRequest).not.toHaveBeenCalled();
      })
      .expect(503)
      .end(done);
  });

  it('should return a 404 when conversation id not found', done => {
    const nonexistentConversationId = '70fc78dc-1aa4-11eb-adc1-0242ac120002';
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
      })
      .end(done);
  });
});
