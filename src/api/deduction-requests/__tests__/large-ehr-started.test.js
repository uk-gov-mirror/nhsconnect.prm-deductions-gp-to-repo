import { v4 as uuid } from 'uuid';
import request from 'supertest';
import app from '../../../app';
import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../../services/database/deduction-request-repository';
import { Status } from '../../../models/deduction-request';
import { logError, logInfo } from '../../../middleware/logging';

jest.mock('../../../middleware/auth');
jest.mock('../../../middleware/logging');
jest.mock('../../../services/database/deduction-request-repository');

describe('PATCH /deduction-requests/:conversationId/large-ehr-started', () => {
  describe('success', () => {
    it('should return 204 and update status to large ehr transfer started', async () => {
      const conversationId = uuid();
      getDeductionRequestByConversationId.mockResolvedValueOnce({
        conversationId,
        status: Status.EHR_REQUEST_SENT
      });
      const res = await request(app).patch(
        `/deduction-requests/${conversationId}/large-ehr-started`
      );

      expect(res.status).toEqual(204);
      expect(logInfo).toHaveBeenCalledWith('Updated deduction request status to largeEhrStarted');
      expect(updateDeductionRequestStatus).toHaveBeenCalledWith(
        conversationId,
        Status.LARGE_EHR_STARTED
      );
    });
  });

  describe('failure', () => {
    it('should return 404 if deduction request not found', async () => {
      getDeductionRequestByConversationId.mockResolvedValueOnce(null);
      const conversationId = uuid();
      const res = await request(app).patch(
        `/deduction-requests/${conversationId}/large-ehr-started`
      );

      expect(updateDeductionRequestStatus).not.toHaveBeenCalled();
      expect(res.status).toEqual(404);
    });

    it('should return a 503 when there is an error getting deduction request from database', async () => {
      getDeductionRequestByConversationId.mockRejectedValueOnce({});
      const conversationId = uuid();
      const res = await request(app).patch(
        `/deduction-requests/${conversationId}/large-ehr-started`
      );

      expect(updateDeductionRequestStatus).not.toHaveBeenCalled();
      expect(res.status).toEqual(503);
      expect(logError).toHaveBeenCalledWith(
        'Could not update deduction request to largeEhrStarted'
      );
    });

    it('should return a 503 when there is an error updating the deduction request status', async () => {
      const conversationId = uuid();
      getDeductionRequestByConversationId.mockResolvedValueOnce({
        conversationId,
        status: Status.EHR_REQUEST_SENT
      });
      updateDeductionRequestStatus.mockRejectedValueOnce({});

      const res = await request(app).patch(
        `/deduction-requests/${conversationId}/large-ehr-started`
      );
      expect(res.status).toEqual(503);
      expect(logError).toHaveBeenCalledWith(
        'Could not update deduction request to largeEhrStarted'
      );
    });
  });

  describe('validation', () => {
    it('should return an error if :conversationId is not valid', async () => {
      const errorMessage = [{ conversationId: "'conversationId' provided is not of type UUIDv4" }];
      const invalidConversationId = '12345';

      const res = await request(app).patch(
        `/deduction-requests/${invalidConversationId}/large-ehr-started`
      );

      expect(res.status).toEqual(422);
      expect(res.body).toEqual({
        errors: errorMessage
      });
    });
  });
});
