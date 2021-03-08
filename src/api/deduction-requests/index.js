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
import { largeEhrStarted, largeEhrStartedValidationRules } from './large-ehr-started';

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
  '/:conversationId/pds-updated',
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

deductionRequests.patch(
  '/:conversationId/large-ehr-started',
  authenticateRequest,
  largeEhrStartedValidationRules,
  validate,
  largeEhrStarted
);

export { deductionRequests };
