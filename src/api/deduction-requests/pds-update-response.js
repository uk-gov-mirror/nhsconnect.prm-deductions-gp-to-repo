import { param } from 'express-validator';
import { updateLogEvent, updateLogEventWithError } from '../../middleware/logging';
import { sendHealthRecordRequest } from '../../services/gp2gp';
import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../services/database/deduction-request-repository';
import { Status } from '../../models/DeductionRequest';

export const pdsResponseValidationRules = [
  param('conversationId')
    .isUUID('4')
    .withMessage("'conversationId' provided is not of type UUIDv4"),
  param('conversationId').not().isEmpty().withMessage(`'conversationId' has not been provided`)
];

export const pdsUpdateResponse = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const deductionRequest = await getDeductionRequestByConversationId(conversationId);
    if (deductionRequest === null) {
      res.sendStatus(404);
      updateLogEvent({ status: 'Conversation id not found' });
      return;
    }

    if (deductionRequest.status === Status.STARTED) {
      res.sendStatus(409);
      updateLogEvent({ status: 'Pds update has not been requested' });
      return;
    }

    if (deductionRequest.status === Status.PDS_UPDATE_SENT) {
      const nhsNumber = deductionRequest.nhs_number;
      await updateDeductionRequestStatus(conversationId, Status.PDS_UPDATED);
      const res = await sendHealthRecordRequest(nhsNumber, conversationId);
      if (res.status !== 204) {
        throw new Error();
      }
      await updateDeductionRequestStatus(conversationId, Status.EHR_REQUEST_SENT);
      updateLogEvent({ status: 'Ehr request sent' });
    }

    res.sendStatus(204);
  } catch (err) {
    updateLogEventWithError(err);
    res.status(503).json({
      errors: err.message
    });
  }
};
