import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { pdsRequestValidationRules, pdsRequest } from './pds-request';
import { pdsResponseValidationRules, pdsUpdateResponse } from './pds-update-response';

const deductionRequests = express.Router();

deductionRequests.post(
  '/:nhsNumber',
  authenticateRequest,
  pdsRequestValidationRules,
  validate,
  pdsRequest
);

deductionRequests.patch(
  '/:conversationId/pds-update',
  authenticateRequest,
  pdsResponseValidationRules,
  validate,
  pdsUpdateResponse
);

export { deductionRequests };
