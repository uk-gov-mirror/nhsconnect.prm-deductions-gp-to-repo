import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { sendRetrievalRequest } from '../../services/gp2gp';
import { handleUpdateRequest } from './handle-update-request';
import { updateLogEventWithError } from '../../middleware/logging';
import { createDeductionRequest } from '../../services/database/create-deduction-request';

export const deductionRequestValidationRules = [
  body('nhsNumber').isNumeric().withMessage("'nhsNumber' provided is not numeric"),
  body('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 characters")
];

export const deductionRequest = async (req, res) => {
  const conversationId = uuid();
  try {
    const pdsRetrievalResponse = await sendRetrievalRequest(req.body.nhsNumber);
    await createDeductionRequest(
      conversationId,
      req.body.nhsNumber,
      pdsRetrievalResponse.data.data.odsCode
    );
    const pdsUpdateResponse = await handleUpdateRequest(pdsRetrievalResponse, req.body.nhsNumber);
    res.status(204).json(pdsUpdateResponse.data);
  } catch (err) {
    updateLogEventWithError(err);
    res.status(503).json({
      errors: err.message
    });
  }
};
