import request from 'supertest';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { when } from 'jest-when';
import { getDeductionRequestByConversationId } from '../../../services/database/deduction-request-repository';

jest.mock('../../../middleware/auth');
jest.mock('../../../services/database/deduction-request-repository', () => ({
  getDeductionRequestByConversationId: jest.fn()
}));

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
});
