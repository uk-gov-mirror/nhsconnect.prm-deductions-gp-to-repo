import axios from 'axios';
import { updateLogEventWithError } from '../middleware/logging';
import * as config from '../config/index';

export const sendRequest = nhsNumber => {
  const { gp2gpUrl, gp2gpAuthKeys } = config.default;
  const url = `${gp2gpUrl}/pds-retrieval/${nhsNumber}`;
  return new Promise((resolve, reject) => {
    return axios
      .get(url, { headers: { Authorization: gp2gpAuthKeys } })
      .then(resolve)
      .catch(error => {
        const axiosError = new Error(`POST ${url} - ${error.message || 'Request failed'}`);
        updateLogEventWithError(axiosError);
        reject(axiosError);
      });
  });
};
