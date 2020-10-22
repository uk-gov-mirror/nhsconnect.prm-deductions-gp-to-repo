import { param } from 'express-validator';
import { sendRetrievalRequest } from '../../services/gp2gp';
import { handleUpdateRequest } from './handle-update-request';
import { updateLogEventWithError } from '../../middleware/logging';

export const pdsRequestValidationRules = [
  param('nhsNumber').isNumeric().withMessage("'nhsNumber' provided is not numeric"),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 characters")
];

export const pdsRequest = async (req, res, next) => {
  try {
    const pdsRetrievalResponse = await sendRetrievalRequest(req.params.nhsNumber);
    const pdsUpdateResponse = await handleUpdateRequest(pdsRetrievalResponse, req.params.nhsNumber);
    res.status(204).json(pdsUpdateResponse.data);
    next();
  } catch (err) {
    updateLogEventWithError(err);
    res.status(503).json({
      errors: err.message
    });
  }
};
