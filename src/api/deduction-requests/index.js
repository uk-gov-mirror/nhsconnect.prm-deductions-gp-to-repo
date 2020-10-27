import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { deductionRequestValidationRules, deductionRequest } from './deduction-request';
import { pdsResponseValidationRules, pdsUpdateResponse } from './pds-update-response';

const deductionRequests = express.Router();

deductionRequests.post(
  '/',
  authenticateRequest,
  deductionRequestValidationRules,
  validate,
  deductionRequest
);

deductionRequests.patch(
  '/:conversationId/pds-update',
  authenticateRequest,
  pdsResponseValidationRules,
  validate,
  pdsUpdateResponse
);

export { deductionRequests };
