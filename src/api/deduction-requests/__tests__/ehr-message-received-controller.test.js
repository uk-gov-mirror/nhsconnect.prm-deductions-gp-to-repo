import request from 'supertest';
import app from '../../../app';
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';
import { when } from 'jest-when';
import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../../services/database/deduction-request-repository';
import { checkEHRComplete } from '../../../services/ehrRepo/ehr-details-request';
import { Status } from '../../../models/deduction-request';
import { logInfo, logError } from '../../../middleware/logging';
import { sendHealthRecordAcknowledgement } from '../../../services/gp2gp/health-record-acknowledgement';

jest.mock('../../../middleware/auth');
jest.mock('../../../services/ehrRepo/ehr-details-request');
jest.mock('../../../services/database/deduction-request-repository', () => ({
  getDeductionRequestByConversationId: jest.fn(),
  updateDeductionRequestStatus: jest.fn()
}));
jest.mock('../../../middleware/logging');
jest.mock('../../../services/gp2gp/health-record-acknowledgement');

describe('PATCH /deduction-requests/:conversationId/ehr-message-received', () => {
  const odsCode = 'B12345';
  const messageId = uuidv1();
  const conversationId = uuidv4();

  it('should return 204', done => {
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhsNumber: '1234567890', odsCode });

    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .send({ messageId })
      .expect(204)
      .end(done);
  });

  it('should return 404 when there is no deduction request for the specified conversationId', done => {
    const nonexistentConversationId = uuidv4();
    when(getDeductionRequestByConversationId)
      .calledWith(nonexistentConversationId)
      .mockResolvedValue(null);
    request(app)
      .patch(`/deduction-requests/${nonexistentConversationId}/ehr-message-received`)
      .send({ messageId })
      .expect(404)
      .end(done);
  });

  it('should return an error if :conversationId is not valid', done => {
    const errorMessage = [{ conversationId: "'conversationId' provided is not of type UUIDv4" }];
    const invalidConversationId = '12345';

    request(app)
      .patch(`/deduction-requests/${invalidConversationId}/ehr-message-received`)
      .send({ messageId })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
      })
      .end(done);
  });

  it('should return an error if :messageId is not valid', done => {
    const errorMessage = [{ messageId: "'messageId' provided is not of type UUID" }];
    const invalidMessageId = '12345';

    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .send({ messageId: invalidMessageId })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
      })
      .end(done);
  });

  it('should accept a messageId of uuidv4', done => {
    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .send({ messageId: uuidv4() })
      .expect(204)
      .end(done);
  });

  it('should update the status if the EHR is complete', done => {
    const nhsNumber = '1234567890';
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhsNumber, odsCode });

    when(checkEHRComplete).calledWith(nhsNumber, conversationId).mockResolvedValue(true);

    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .send({ messageId })
      .expect(204)
      .expect(() => {
        expect(checkEHRComplete).toHaveBeenCalledWith(nhsNumber, conversationId);
        expect(updateDeductionRequestStatus).toHaveBeenCalledWith(
          conversationId,
          Status.EHR_REQUEST_RECEIVED
        );
        expect(logInfo).toHaveBeenCalledWith('Ehr request received and acknowledgement sent');
      })
      .end(done);
  });

  it('should send acknowledgement with correct values when the EHR is complete', done => {
    const nhsNumber = '1234567890';
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhsNumber, odsCode });

    when(checkEHRComplete).calledWith(nhsNumber, conversationId).mockResolvedValue(true);

    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .send({ messageId })
      .expect(204)
      .send({ messageId })
      .expect(() => {
        expect(checkEHRComplete).toHaveBeenCalledWith(nhsNumber, conversationId);
        expect(sendHealthRecordAcknowledgement).toHaveBeenCalledWith(
          nhsNumber,
          conversationId,
          odsCode,
          messageId
        );
      })
      .end(done);
  });

  it('should not update the status if the EHR is not complete', done => {
    const nhsNumber = '1234567890';
    when(getDeductionRequestByConversationId)
      .calledWith(conversationId)
      .mockResolvedValue({ nhsNumber, odsCode });

    when(checkEHRComplete).calledWith(nhsNumber, conversationId).mockResolvedValue(false);

    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .send({ messageId })
      .expect(204)
      .expect(() => {
        expect(checkEHRComplete).toHaveBeenCalledWith(nhsNumber, conversationId);
        expect(updateDeductionRequestStatus).not.toHaveBeenCalled();
      })
      .end(done);
  });

  it('should not update the status when retrieving the health record request fails', done => {
    const nhsNumber = '1234567890';

    when(getDeductionRequestByConversationId).calledWith(conversationId).mockResolvedValue({
      nhsNumber,
      odsCode,
      status: Status.EHR_REQUEST_RECEIVED
    });
    when(checkEHRComplete)
      .calledWith(nhsNumber, conversationId)
      .mockImplementation(() => {
        throw new Error('Cannot retrieve the record');
      });

    request(app)
      .patch(`/deduction-requests/${conversationId}/ehr-message-received`)
      .send({ messageId })
      .expect(() => {
        expect(checkEHRComplete).toHaveBeenCalled();
        expect(updateDeductionRequestStatus).not.toHaveBeenCalledWith(
          conversationId,
          Status.EHR_REQUEST_RECEIVED
        );
        expect(logError).toHaveBeenCalled();
      })
      .expect(503)
      .end(done);
  });
});
