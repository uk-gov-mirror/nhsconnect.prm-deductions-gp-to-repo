import axios from 'axios';
import { initialiseConfig } from '../../config/index';
import { logError, logEvent } from '../../middleware/logging';

export const checkEHRComplete = async (nhsNumber, conversationId) => {
  try {
    const config = initialiseConfig();
    if (config.useNewEhrRepoApi) {
      const url = `${config.ehrRepoUrl}/new/patients/${nhsNumber}/health-records/${conversationId}`;
      const response = await axios.get(url, { headers: { Authorization: config.ehrRepoAuthKeys } });
      logEvent(`EHR Status for conversationId ${conversationId}: successful`);
      return response.status === 200;
    } else {
      const url = `${config.ehrRepoUrl}/patients/${nhsNumber}/health-records/${conversationId}`;
      const response = await axios.get(url, { headers: { Authorization: config.ehrRepoAuthKeys } });
      const responseBody = response.data;
      const { status } = responseBody.data.attributes;
      logEvent(`EHR Status for conversationId ${conversationId}: ${status}`);
      return status === 'success';
    }
  } catch (err) {
    const errorMessage = `Error retrieving EHR details - axios error: ${err.message}`;
    logError(errorMessage, err);
    throw new Error(errorMessage);
  }
};
