import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { pdsRequestValidationRules, pdsRequest } from './pds-request';

const deductionRequests = express.Router();

deductionRequests.post(
  '/:nhsNumber',
  authenticateRequest,
  pdsRequestValidationRules,
  validate,
  pdsRequest
);

export { deductionRequests };
