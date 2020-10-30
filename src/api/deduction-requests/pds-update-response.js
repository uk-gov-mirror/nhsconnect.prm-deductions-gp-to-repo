import { updateLogEventWithError } from '../../middleware/logging';
import { sendHealthRecordRequest } from '../../services/gp2gp';
import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../services/database/deduction-request-repository';

export const pdsResponseValidationRules = [];
export const pdsUpdateResponse = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const deductionRequest = await getDeductionRequestByConversationId(conversationId);
    if (deductionRequest === null) {
      res.sendStatus(404);
      return;
    }

    if (deductionRequest.status === 'started') {
      res.sendStatus(409);
      return;
    }

    if (deductionRequest.status === 'pds_update_sent') {
      const nhsNumber = deductionRequest.nhs_number;
      await updateDeductionRequestStatus(conversationId, 'pds_updated');
      const res = await sendHealthRecordRequest(nhsNumber);
      // TODO: verify that the assumption of the status is correct
      if (res.status !== 204) {
        throw new Error();
      }
      await updateDeductionRequestStatus(conversationId, 'ehr_request_sent');
    }

    res.sendStatus(204);
  } catch (err) {
    updateLogEventWithError(err);
    res.status(503).json({
      errors: err.message
    });
  }
};
