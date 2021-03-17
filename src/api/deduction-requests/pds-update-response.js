import { param } from 'express-validator';
import { logInfo, logError } from '../../middleware/logging';
import { sendHealthRecordRequest } from '../../services/gp2gp';
import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../services/database/deduction-request-repository';
import { Status } from '../../models/deduction-request';
import { setCurrentSpanAttributes } from '../../config/tracing';

export const pdsResponseValidationRules = [
  param('conversationId')
    .isUUID('4')
    .withMessage("'conversationId' provided is not of type UUIDv4"),
  param('conversationId').not().isEmpty().withMessage(`'conversationId' has not been provided`)
];

export const pdsUpdateResponse = async (req, res) => {
  try {
    const { conversationId } = req.params;
    setCurrentSpanAttributes({ conversationId });

    const deductionRequest = await getDeductionRequestByConversationId(conversationId);
    if (deductionRequest === null) {
      res.sendStatus(404);
      logInfo('Conversation id not found');
      return;
    }

    if (deductionRequest.status === Status.STARTED) {
      res.sendStatus(409);
      logInfo('Pds update has not been requested');
      return;
    }

    if (deductionRequest.status === Status.PDS_UPDATE_SENT) {
      await updateDeductionRequestStatus(conversationId, Status.PDS_UPDATED);
      const res = await sendHealthRecordRequest(
        deductionRequest.nhsNumber,
        conversationId,
        deductionRequest.odsCode
      );
      if (res.status !== 204) {
        throw new Error(`EHR request failed with status ${res.status}`);
      }
      await updateDeductionRequestStatus(conversationId, Status.EHR_REQUEST_SENT);
      logInfo('EHR request sent');
    }

    res.sendStatus(204);
  } catch (err) {
    logError('pdsUpdateResponse failed', { err });
    res.status(503).json({
      errors: err.message
    });
  }
};
