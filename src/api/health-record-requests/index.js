import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { healthRecordValidationRules, healthRecordRequest } from './health-record-requests';

const healthRecordRequests = express.Router();

healthRecordRequests.post(
  '/:nhsNumber',
  authenticateRequest,
  healthRecordValidationRules,
  validate,
  healthRecordRequest
);

export { healthRecordRequests };
