import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../services/database/deduction-request-repository';
import { param } from 'express-validator';
import { checkEHRComplete } from '../../services/ehrRepo/ehr-details-request';
import { Status } from '../../models/DeductionRequest';

export const ehrMessageReceivedValidationRules = [
  param('conversationId').isUUID('4').withMessage("'conversationId' provided is not of type UUIDv4")
];

export const ehrMessageReceived = async (req, res) => {
  const { conversationId } = req.params;
  const deductionRequest = await getDeductionRequestByConversationId(conversationId);
  if (deductionRequest === null) {
    res.sendStatus(404);
    return;
  }
  const isEhrComplete = await checkEHRComplete(deductionRequest.nhs_number, conversationId);
  if (isEhrComplete) {
    await updateDeductionRequestStatus(conversationId, Status.EHR_REQUEST_RECEIVED);
  }
  res.sendStatus(204);
};
