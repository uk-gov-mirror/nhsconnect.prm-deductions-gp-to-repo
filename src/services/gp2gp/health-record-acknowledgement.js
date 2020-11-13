import axios from 'axios';
import { initialiseConfig } from '../../config/index';
import { updateLogEventWithError } from '../../middleware/logging';

export const sendHealthRecordAcknowledgement = async (
  nhsNumber,
  conversationId,
  odsCode,
  messageId
) => {
  try {
    const url = `${
      initialiseConfig().gp2gpUrl
    }/health-record-requests/${nhsNumber}/acknowledgement`;
    return await axios.post(
      url,
      { conversationId, odsCode, messageId },
      { headers: { Authorization: initialiseConfig().gp2gpAuthKeys } }
    );
  } catch (err) {
    updateLogEventWithError(err);
    throw new Error(`Error sending EHR acknowledgement - axios error: ${err.message}`);
  }
};
