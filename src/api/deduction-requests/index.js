import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { pdsValidationRules, pdsRequest } from './deduction-requests';

const deductionRequests = express.Router();

deductionRequests.post(
  '/:nhsNumber',
  authenticateRequest,
  pdsValidationRules,
  validate,
  pdsRequest
);

export { deductionRequests };
