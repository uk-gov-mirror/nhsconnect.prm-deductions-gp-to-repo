import express from 'express';
import { param } from 'express-validator';
import { sendRetrievalRequest } from '../services/gp2gp-service';
import { handleUpdateRequest } from './handle-update-request';
import { checkIsAuthenticated } from '../middleware/auth';
import { updateLogEventWithError } from '../middleware/logging';
import { validate } from '../middleware/validation';
const router = express.Router();

const validationRules = [
  param('nhsNumber')
    .isNumeric()
    .withMessage("'nhsNumber' provided is not numeric"),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 characters")
];

router.post(
  '/:nhsNumber',
  checkIsAuthenticated,
  validationRules,
  validate,
  async (req, res, next) => {
    try {
      const pdsRetrievalResponse = await sendRetrievalRequest(req.params.nhsNumber);
      const pdsUpdateResponse = await handleUpdateRequest(
        pdsRetrievalResponse,
        req.params.nhsNumber
      );
      res.status(204).json(pdsUpdateResponse.data);
      next();
    } catch (err) {
      updateLogEventWithError(err);
      res.status(503).json({
        errors: err.message
      });
    }
  }
);

export default router;
