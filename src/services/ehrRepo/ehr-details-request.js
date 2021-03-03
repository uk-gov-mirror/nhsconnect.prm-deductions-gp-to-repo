import axios from 'axios';
import { initializeConfig } from '../../config/index';
import { logError, logInfo } from '../../middleware/logging';

export const checkEHRComplete = async (nhsNumber, conversationId) => {
  try {
    const config = initializeConfig();
    const url = `${config.ehrRepoUrl}/patients/${nhsNumber}/health-records/${conversationId}`;
    const response = await axios.get(url, { headers: { Authorization: config.ehrRepoAuthKeys } });
    logInfo(`EHR Status for conversationId ${conversationId}: successful`);
    return response.status === 200;
  } catch (err) {
    const errorMessage = `Error retrieving EHR details - axios error: ${err.message}`;
    logError(`${errorMessage}`, { err });
    throw new Error(errorMessage);
  }
};
