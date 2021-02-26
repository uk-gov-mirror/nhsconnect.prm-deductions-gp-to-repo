import axios from 'axios';
import { initializeConfig } from '../../config/index';
import { logError } from '../../middleware/logging';

export const sendHealthRecordAcknowledgement = async (
  nhsNumber,
  conversationId,
  odsCode,
  messageId
) => {
  try {
    const { repositoryAsid } = initializeConfig();
    const url = `${
      initializeConfig().gp2gpUrl
    }/health-record-requests/${nhsNumber}/acknowledgement`;
    return await axios.post(
      url,
      { conversationId, odsCode, messageId, repositoryAsid },
      { headers: { Authorization: initializeConfig().gp2gpAuthKeys } }
    );
  } catch (err) {
    const errorMessage = `Error sending EHR acknowledgement - axios error: ${err.message}`;
    logError(`${errorMessage}`, { err });
    throw new Error(errorMessage);
  }
};
