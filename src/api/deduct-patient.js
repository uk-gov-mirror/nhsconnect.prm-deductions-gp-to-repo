import express from 'express';
import { param } from 'express-validator';
import { sendRetrievalRequest } from '../services/gp2gp-service';
import { checkIsAuthenticated } from '../middleware/auth';
import { updateLogEventWithError, updateLogEvent } from '../middleware/logging';
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
      const gp2gpResponse = await sendRetrievalRequest(req.params.nhsNumber);

      switch (gp2gpResponse.status) {
        case 200:
          updateLogEvent({
            status: '200 GP2GP response received',
            response: gp2gpResponse
          });
          res.status(200).json(gp2gpResponse.data);
          break;
        default:
          throw new Error(`Unexpected Error: ${gp2gpResponse.data}`);
      }
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
