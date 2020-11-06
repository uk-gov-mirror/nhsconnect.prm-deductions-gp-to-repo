import { getDeductionRequestByConversationId } from '../../services/database/deduction-request-repository';
import { param } from 'express-validator';

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
  res.sendStatus(204);
};
