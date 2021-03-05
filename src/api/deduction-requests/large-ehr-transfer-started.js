import { param } from 'express-validator';
import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../services/database/deduction-request-repository';
import { Status } from '../../models/deduction-request';
import { logError, logInfo } from '../../middleware/logging';

export const largeEhrTransferStartedValidationRules = [
  param('conversationId').isUUID().withMessage("'conversationId' provided is not of type UUIDv4")
];

export const largeEhrTransferStarted = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const deductionRequest = await getDeductionRequestByConversationId(conversationId);
    if (deductionRequest === null) {
      res.sendStatus(404);
      return;
    }

    await updateDeductionRequestStatus(conversationId, Status.LARGE_EHR_TRANSFER_STARTED);
    logInfo('Updated deduction request status to largeEhrTransferStarted');
    res.sendStatus(204);
  } catch (err) {
    logError('Could not update deduction request to largeEhrTransferStarted');
    res.sendStatus(503);
  }
};
