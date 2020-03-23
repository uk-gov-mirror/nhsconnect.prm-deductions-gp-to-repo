import axios from 'axios';
import { updateLogEventWithError } from '../../middleware/logging';
import * as config from '../../config/index';

const { gp2gpUrl, gp2gpAuthKeys } = config.default;

export const sendUpdateRequest = (serialChangeNumber, pdsId, nhsNumber) => {
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

  return axios.patch(url, axiosBody, axiosHeaders).catch(error => {
    const axiosError = new Error(
      `PATCH ${url} - ${error.message || 'Request failed'}, body: ${(axiosBody.serialChangeNumber,
      axiosBody.pdsId)}`
    );
    updateLogEventWithError(axiosError);
    throw axiosError;
  });
};
