import axios from 'axios';
import { initialiseConfig } from '../../config/index';
import { updateLogEventWithError } from '../../middleware/logging';

export const checkEHRComplete = async (nhsNumber, conversationId) => {
  const config = initialiseConfig();
  const url = `${config.ehrRepoUrl}/patients/${nhsNumber}/health-record/${conversationId}`;
  return axios.get(url, { headers: { Authorization: config.ehrRepoAuthKeys } }).catch(err => {
    updateLogEventWithError(err);
    throw err;
  });
};
