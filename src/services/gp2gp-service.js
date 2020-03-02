import axios from 'axios';
import { updateLogEventWithError } from '../middleware/logging';
import * as config from '../config/index';

export const sendRequest = nhsNumber => {
  const url = `${config.default.gp2gpUrl}/${nhsNumber}`;
  return new Promise((resolve, reject) => {
    return axios
      .get(url)
      .then(resolve)
      .catch(error => {
        const axiosError = new Error(`POST ${url} - ${error.message || 'Request failed'}`);
        updateLogEventWithError(axiosError);
        reject(axiosError);
      });
  });
};
