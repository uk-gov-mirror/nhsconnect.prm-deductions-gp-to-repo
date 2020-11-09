import request from 'supertest';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { when } from 'jest-when';
import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../../services/database/deduction-request-repository';
import { checkEHRComplete } from '../../../services/ehrRepo/ehr-details-request';
import { Status } from '../../../models/DeductionRequest';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';

jest.mock('../../../middleware/auth');
jest.mock('../../../services/ehrRepo/ehr-details-request');
jest.mock('../../../services/database/deduction-request-repository', () => ({
  getDeductionRequestByConversationId: jest.fn(),
  updateDeductionRequestStatus: jest.fn()
}));
jest.mock('../../../middleware/logging');

describe('PATCH /deduction-requests/:conversationId/ehr-message-received', () => {
  it('should return 204', done => {
    const conversationId = uuid();
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhs_number: '1234567890' });

    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .expect(204)
      .end(done);
  });

  it('should return 404 when there is no deduction request for the specified conversationId', done => {
    const nonexistentConversationId = uuid();
    when(getDeductionRequestByConversationId)
      .calledWith(nonexistentConversationId)
      .mockResolvedValue(null);
    request(app)
      .patch(`/deduction-requests/${nonexistentConversationId}/ehr-message-received`)
      .expect(404)
      .end(done);
  });

  it('should return an error if :conversationId is not valid', done => {
    const errorMessage = [{ conversationId: "'conversationId' provided is not of type UUIDv4" }];
    const invalidConversationId = '12345';

    request(app)
      .patch(`/deduction-requests/${invalidConversationId}/ehr-message-received`)
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
      })
      .end(done);
  });

  it('should update the status if the EHR is complete', done => {
    const conversationId = uuid();
    const nhsNumber = '1234567890';
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhs_number: nhsNumber });

    when(checkEHRComplete).calledWith(nhsNumber, conversationId).mockResolvedValue(true);

    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .expect(204)
      .expect(() => {
        expect(checkEHRComplete).toHaveBeenCalledWith(nhsNumber, conversationId);
        expect(updateDeductionRequestStatus).toHaveBeenCalledWith(
          conversationId,
          Status.EHR_REQUEST_RECEIVED
        );
        expect(updateLogEvent).toHaveBeenCalledWith({ status: 'Ehr request received' });
      })
      .end(done);
  });

  it('should not update the status if the EHR is not complete', done => {
    const conversationId = uuid();
    const nhsNumber = '1234567890';
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhs_number: nhsNumber });

    when(checkEHRComplete).calledWith(nhsNumber, conversationId).mockResolvedValue(false);

    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .expect(204)
      .expect(() => {
        expect(checkEHRComplete).toHaveBeenCalledWith(nhsNumber, conversationId);
        expect(updateDeductionRequestStatus).not.toHaveBeenCalled();
      })
      .end(done);
  });

  it('should not update the status when retrieving the health record request fails', done => {
    const conversationId = uuid();
    const nhsNumber = '1234567890';

    when(getDeductionRequestByConversationId).calledWith(conversationId).mockResolvedValue({
      nhs_number: nhsNumber,
      ods_code: 'Z1234',
      status: Status.EHR_REQUEST_RECEIVED
    });
    when(checkEHRComplete)
      .calledWith(nhsNumber, conversationId)
      .mockImplementation(() => {
        throw new Error('Cannot retrieve the record');
      });

    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .expect(() => {
        expect(checkEHRComplete).toHaveBeenCalled();
        expect(updateDeductionRequestStatus).not.toHaveBeenCalledWith(
          conversationId,
          Status.EHR_REQUEST_RECEIVED
        );
        expect(updateLogEventWithError).toHaveBeenCalled();
      })
      .expect(503)
      .end(done);
  });
});
