import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { getSpan, context } from '@opentelemetry/api';
import { sendRetrievalRequest } from '../../services/gp2gp';
import { handleUpdateRequest } from './handle-update-request';
import { logError, logInfo } from '../../middleware/logging';
import { createDeductionRequest } from '../../services/database/create-deduction-request';
import config from '../../config/index';

export const deductionRequestValidationRules = [
  body('nhsNumber').isNumeric().withMessage("'nhsNumber' provided is not numeric"),
  body('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 characters")
];

export const deductionRequest = async (req, res) => {
  const conversationId = uuid();
  const currentSpan = getSpan(context.active());

  if (currentSpan) {
    // TODO: use setAttribute instead of overriding the object
    currentSpan.attributes = { conversationId };
  }

  try {
    const pdsRetrievalResponse = await sendRetrievalRequest(req.body.nhsNumber);
    await createDeductionRequest(
      conversationId,
      req.body.nhsNumber,
      pdsRetrievalResponse.data.data.odsCode
    );
    await handleUpdateRequest(pdsRetrievalResponse, req.body.nhsNumber, conversationId);

    const statusEndpoint = `${config.url}/deduction-requests/${conversationId}`;

    logInfo('deductionRequest successful');
    res.set('Location', statusEndpoint).sendStatus(201);
  } catch (err) {
    logError('deductionRequest failed', { err });
    res.status(503).json({
      errors: err.message
    });
  }
};
