import axios from 'axios';
import { logError } from '../../middleware/logging';
import * as config from '../../config/index';

const { gp2gpUrl, gp2gpAuthKeys } = config.default;

export const sendRetrievalRequest = nhsNumber => {
  const url = `${gp2gpUrl}/patient-demographics/${nhsNumber}`;
  return axios.get(url, { headers: { Authorization: gp2gpAuthKeys } }).catch(error => {
    const errorMessage = `GET ${url} - ${error.message || 'Request failed'}`;
    const axiosError = new Error(errorMessage);
    logError(errorMessage, error);
    throw axiosError;
  });
};
