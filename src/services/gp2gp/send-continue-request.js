import axios from 'axios';
import { initializeConfig } from '../../config';
import { logError, logInfo } from '../../middleware/logging';

export const sendContinueRequest = async (conversationId, ehrExtractMessageId, gpOdsCode) => {
  const config = initializeConfig();
  const url = `${config.gp2gpUrl}/health-record-requests/continue-message`;
  const body = { conversationId, ehrExtractMessageId, gpOdsCode };
  const headers = { headers: { Authorization: config.gp2gpAuthKeys } };

  try {
    await axios.post(url, body, headers);
    logInfo('Successfully sent continue message');
  } catch (err) {
    logError('Failed to send continue request', err);
    throw err;
  }
};
