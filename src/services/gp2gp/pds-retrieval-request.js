import axios from 'axios';
import { updateLogEventWithError } from '../../middleware/logging';
import * as config from '../../config/index';

const { gp2gpUrl, gp2gpAuthKeys } = config.default;

export const sendRetrievalRequest = nhsNumber => {
  const url = `${gp2gpUrl}/patient-demographics/${nhsNumber}`;
  return axios.get(url, { headers: { Authorization: gp2gpAuthKeys } }).catch(error => {
    const axiosError = new Error(`GET ${url} - ${error.message || 'Request failed'}`);
    updateLogEventWithError(axiosError);
    throw axiosError;
  });
};
