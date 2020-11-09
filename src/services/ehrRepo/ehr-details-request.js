import axios from 'axios';
import { initialiseConfig } from '../../config/index';
import { updateLogEventWithError } from '../../middleware/logging';

export const checkEHRComplete = async (nhsNumber, conversationId) => {
  try {
    const config = initialiseConfig();
    const url = `${config.ehrRepoUrl}/patients/${nhsNumber}/health-record/${conversationId}`;
    const response = await axios.get(url, { headers: { Authorization: config.ehrRepoAuthKeys } });
    const responseBody = response.data;
    const { status } = responseBody.data.attributes;
    return status === 'success';
  } catch (err) {
    updateLogEventWithError(err);
    throw new Error(`Error retrieving EHR details - axios error: ${err.message}`);
  }
};
