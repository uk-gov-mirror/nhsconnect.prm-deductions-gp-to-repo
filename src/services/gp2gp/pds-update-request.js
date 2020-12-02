import axios from 'axios';
import { logError } from '../../middleware/logging';
import * as config from '../../config/index';

const { gp2gpUrl, gp2gpAuthKeys, repositoryOdsCode } = config.default;

export const sendUpdateRequest = (serialChangeNumber, pdsId, nhsNumber, conversationId) => {
  const url = `${gp2gpUrl}/patient-demographics/${nhsNumber}`;

  const axiosBody = {
    serialChangeNumber,
    pdsId,
    newOdsCode: repositoryOdsCode,
    conversationId
  };

  const axiosHeaders = {
    headers: {
      Authorization: gp2gpAuthKeys
    }
  };

  return axios.patch(url, axiosBody, axiosHeaders).catch(error => {
    const errorMessage = `PATCH ${url} - ${error.message || 'Request failed'}, body: ${
      (axiosBody.serialChangeNumber, axiosBody.pdsId)
    }`;
    const axiosError = new Error(errorMessage);
    logError(errorMessage, error);
    throw axiosError;
  });
};
