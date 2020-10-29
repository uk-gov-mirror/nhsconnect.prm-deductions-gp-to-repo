import request from 'supertest';
import { when } from 'jest-when';
import { updateLogEvent } from '../../../middleware/logging';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { getDeductionRequestByConversationId } from '../../../services/database/deduction-request-repository';

jest.mock('../../../config/logging');
jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');
jest.mock('uuid');
const conversationId = 'c9b24d61-f5b0-4329-a731-e73064d89832';
uuid.mockImplementation(() => conversationId);

const nhsNumber = '1234567890';
const status = 'updated';
const invalidConversationId = 'fd9271ea-9086-4f7e-8993-0271518fdb6f';

jest.mock('../../../services/database/deduction-request-repository');

function generateLogEvent(message) {
  return {
    status: 'validation-failed',
    validation: {
      errors: message,
      status: 'failed'
    }
  };
}

describe('GET /deduction-requests/', () => {
  beforeEach(() => {
    when(getDeductionRequestByConversationId)
      .calledWith(invalidConversationId)
      .mockResolvedValue(null)
      .calledWith(conversationId)
      .mockResolvedValue({ nhs_number: nhsNumber, status });
  });

  it('should return a 200 if :conversationId is uuid and Authorization Header provided', done => {
    request(app).get(`/deduction-requests/${conversationId}`).expect(200).end(done);
  });

  it('should return deduction request information', done => {
    request(app)
      .get(`/deduction-requests/${conversationId}`)
      .expect(res => {
        expect(res.body).toEqual({
          data: {
            type: 'deduction-requests',
            id: conversationId,
            attributes: {
              nhsNumber,
              status
            }
          }
        });
      })
      .end(done);
  });

  it('should return an error if :conversationId is not valid', done => {
    const errorMessage = [{ conversationId: "'conversationId' provided is not of type UUIDv4" }];
    request(app)
      .get('/deduction-requests/1234')
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(updateLogEvent).toHaveBeenCalledTimes(1);
        expect(updateLogEvent).toHaveBeenCalledWith(generateLogEvent(errorMessage));
      })
      .end(done);
  });

  it('should call createDeductionRequest with conversationId', done => {
    request(app)
      .get(`/deduction-requests/${conversationId}`)
      .expect(() => {
        expect(getDeductionRequestByConversationId).toHaveBeenCalledWith(conversationId);
      })
      .end(done);
  });

  it('should return 404 when conversation id cannot be found', async done => {
    request(app)
      .get(`/deduction-requests/${invalidConversationId}`)
      .expect(404)
      .expect(() => {
        expect(getDeductionRequestByConversationId).toHaveBeenCalledWith(invalidConversationId);
      })
      .end(done);
  });
});
