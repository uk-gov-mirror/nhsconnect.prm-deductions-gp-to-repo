import axios from 'axios';
import config from '../../config/index';

export const sendHealthRecordRequest = (nhsNumber, conversationId, practiceOdsCode) => {
  const url = `${config.gp2gpUrl}/health-record-requests/${nhsNumber}`;

  const axiosHeaders = {
    headers: {
      Authorization: config.gp2gpAuthKeys
    }
  };

  return axios.post(
    url,
    {
      repositoryOdsCode: config.repositoryOdsCode,
      repositoryAsid: config.repositoryAsid,
      practiceOdsCode: practiceOdsCode,
      conversationId
    },
    axiosHeaders
  );
};
