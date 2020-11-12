import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../services/database/deduction-request-repository';
import { param } from 'express-validator';
import { checkEHRComplete } from '../../services/ehrRepo/ehr-details-request';
import { Status } from '../../models/deduction-request';
import { updateLogEvent, updateLogEventWithError } from '../../middleware/logging';
import { sendHealthRecordAcknowledgement } from '../../services/gp2gp/health-record-acknowledgement';

export const ehrMessageReceivedValidationRules = [
  param('conversationId').isUUID('4').withMessage("'conversationId' provided is not of type UUIDv4")
];

export const ehrMessageReceived = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const deductionRequest = await getDeductionRequestByConversationId(conversationId);
    if (deductionRequest === null) {
      res.sendStatus(404);
      return;
    }
    const isEhrComplete = await checkEHRComplete(deductionRequest.nhsNumber, conversationId);
    if (isEhrComplete) {
      await updateDeductionRequestStatus(conversationId, Status.EHR_REQUEST_RECEIVED);
      await sendHealthRecordAcknowledgement(
        deductionRequest.nhsNumber,
        conversationId,
        deductionRequest.odsCode
      );
      updateLogEvent({ status: 'Ehr request received and acknowledgement sent' });
    }
    res.sendStatus(204);
  } catch (err) {
    updateLogEventWithError(err);
    res.status(503).json({
      errors: err.message
    });
  }
};
