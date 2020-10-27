import { updateLogEventWithError } from '../../middleware/logging';
import { sendHealthRecordRequest } from '../../services/gp2gp';
import { getDeductionRequestByConversationId } from '../../services/database/deduction-request-repository';

export const pdsResponseValidationRules = [];
export const pdsUpdateResponse = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { nhsNumber } = getDeductionRequestByConversationId(conversationId);
    await sendHealthRecordRequest(nhsNumber);
    res.sendStatus(204);
  } catch (err) {
    updateLogEventWithError(err);
    res.status(503).json({
      errors: err.message
    });
  }
};
