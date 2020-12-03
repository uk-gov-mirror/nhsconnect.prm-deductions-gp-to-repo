import request from 'supertest';
import app from '../../../app';
import { Status } from '../../../models/deduction-request';
import { getDeductionRequestByConversationId } from '../../../services/database/deduction-request-repository';
import { logError } from '../../../middleware/logging';

jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');
jest.mock('../../../config/logging');
jest.mock('../../../services/database/deduction-request-repository');

describe('GET /deduction-requests/', () => {
  const conversationId = 'c9b24d61-f5b0-4329-a731-e73064d89832';
  const nhsNumber = '1234567890';
  const status = Status.STARTED;
  const invalidConversationId = 'f5b0-4329-a731-e73064d89832';

  it('should return a 200 if :conversationId is uuid and Authorization Header provided', async () => {
    getDeductionRequestByConversationId.mockResolvedValue({ nhsNumber, status, conversationId });

    const mockBody = {
      data: {
        type: 'deduction-requests',
        id: conversationId,
        attributes: {
          nhsNumber,
          status
        }
      }
    };

    const res = await request(app).get(`/deduction-requests/${conversationId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockBody);
    expect(getDeductionRequestByConversationId).toHaveBeenCalledWith(conversationId);
  });

  it('should return an error if :conversationId is not valid', async () => {
    const errorMessage = [{ conversationId: "'conversationId' provided is not of type UUIDv4" }];

    const res = await request(app).get(`/deduction-requests/${invalidConversationId}`);

    expect(res.statusCode).toBe(422);
    expect(logError).toHaveBeenCalledWith('validation-failed', { errors: errorMessage });
    expect(res.body).toEqual({
      errors: errorMessage
    });
  });

  it('should return 404 when conversation id cannot be found', async () => {
    const nonExistentConversationId = conversationId;
    getDeductionRequestByConversationId.mockResolvedValue(null);
    const res = await request(app).get(`/deduction-requests/${nonExistentConversationId}`);

    expect(getDeductionRequestByConversationId).toHaveBeenCalledWith(nonExistentConversationId);
    expect(res.statusCode).toBe(404);
  });
});
