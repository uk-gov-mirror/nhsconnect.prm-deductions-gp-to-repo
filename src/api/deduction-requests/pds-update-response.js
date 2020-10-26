import { updateLogEventWithError } from '../../middleware/logging';
import { sendHealthRecordRequest } from '../../services/gp2gp';

export const pdsResponseValidationRules = [];
const nhsNumber = '1234567890';
export const pdsUpdateResponse = async (req, res) => {
  try {
    await sendHealthRecordRequest(nhsNumber);
    res.sendStatus(204);
  } catch (err) {
    updateLogEventWithError(err);
    res.status(503).json({
      errors: err.message
    });
  }
};
