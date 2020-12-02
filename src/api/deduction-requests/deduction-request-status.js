import { param } from 'express-validator';
import { logError } from '../../middleware/logging';
import { getDeductionRequestByConversationId } from '../../services/database/deduction-request-repository';

export const deductionRequestStatusValidationRules = [
  param('conversationId')
    .isUUID('4')
    .withMessage("'conversationId' provided is not of type UUIDv4"),
  param('conversationId').not().isEmpty().withMessage(`'conversationId' has not been provided`)
];

export const deductionRequestStatus = async (req, res) => {
  try {
    const requestStatus = await getDeductionRequestByConversationId(req.params.conversationId);

    if (requestStatus === null) return res.sendStatus(404);

    const data = {
      data: {
        type: 'deduction-requests',
        id: req.params.conversationId,
        attributes: {
          nhsNumber: requestStatus.nhsNumber,
          status: requestStatus.status
        }
      }
    };
    res.status(200).json(data);
  } catch (err) {
    logError('deductionRequestStatus failed', err);
    res.status(503).json({
      errors: err.message
    });
  }
};
