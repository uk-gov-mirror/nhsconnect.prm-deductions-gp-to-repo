import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { deductionRequestValidationRules, deductionRequest } from './deduction-request';
import { pdsResponseValidationRules, pdsUpdateResponse } from './pds-update-response';
import {
  deductionRequestStatusValidationRules,
  deductionRequestStatus
} from './deduction-request-status';
import {
  ehrMessageReceived,
  ehrMessageReceivedValidationRules
} from './ehr-message-received-controller';

const deductionRequests = express.Router();

deductionRequests.post(
  '/',
  authenticateRequest,
  deductionRequestValidationRules,
  validate,
  deductionRequest
);

deductionRequests.get(
  '/:conversationId',
  authenticateRequest,
  deductionRequestStatusValidationRules,
  validate,
  deductionRequestStatus
);

deductionRequests.patch(
  '/:conversationId/pds-update',
  authenticateRequest,
  pdsResponseValidationRules,
  validate,
  pdsUpdateResponse
);

deductionRequests.patch(
  '/:conversationId/ehr-message-received',
  authenticateRequest,
  ehrMessageReceivedValidationRules,
  validate,
  ehrMessageReceived
);

export { deductionRequests };
