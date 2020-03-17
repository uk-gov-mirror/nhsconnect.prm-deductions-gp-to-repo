import axios from 'axios';
import { updateLogEventWithError } from '../middleware/logging';
import * as config from '../config/index';

const { gp2gpUrl, gp2gpAuthKeys } = config.default;

const sendRetrievalRequest = nhsNumber => {
  const url = `${gp2gpUrl}/patient-demographics/${nhsNumber}`;
  return new Promise((resolve, reject) => {
    return axios
      .get(url, { headers: { Authorization: gp2gpAuthKeys } })
      .then(resolve)
      .catch(error => {
        const axiosError = new Error(`GET ${url} - ${error.message || 'Request failed'}`);
        updateLogEventWithError(axiosError);
        reject(axiosError);
      });
  });
};

const sendUpdateRequest = (serialChangeNumber, pdsId, nhsNumber) => {
  const url = `${gp2gpUrl}/patient-demographics/${nhsNumber}`;

  const axiosBody = {
    serialChangeNumber,
    pdsId
  };

  const axiosHeaders = {
    headers: {
      Authorization: gp2gpAuthKeys
    }
  };

  return new Promise((resolve, reject) => {
    return axios
      .patch(url, axiosBody, axiosHeaders)
      .then(resolve)
      .catch(error => {
        const axiosError = new Error(
          `PATCH ${url} - ${error.message ||
            'Request failed'}, body: ${(axiosBody.serialChangeNumber, axiosBody.pdsId)}`
        );
        updateLogEventWithError(axiosError);
        reject(axiosError);
      });
  });
};

export { sendRetrievalRequest, sendUpdateRequest };
