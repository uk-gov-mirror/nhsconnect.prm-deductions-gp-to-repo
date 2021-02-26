import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { initializeConfig } from '../../../config/index';
import { sendHealthRecordAcknowledgement } from '../health-record-acknowledgement';

jest.mock('../../../middleware/logging');
jest.mock('axios');
jest.mock('../../../config/');

const nhsNumber = '1111111111';
const conversationId = uuid();
const messageId = uuid();
const odsCode = 'B12345';

describe('sendHealthRecordAcknowledgement', () => {
  initializeConfig.mockReturnValue({
    gp2gpUrl: 'gp2gp-url',
    gp2gpAuthKeys: 'secret',
    repositoryAsid: '200000001162'
  });

  const headers = { headers: { Authorization: `${initializeConfig().gp2gpAuthKeys}` } };
  const url = `${initializeConfig().gp2gpUrl}/health-record-requests/${nhsNumber}/acknowledgement`;
  const body = {
    conversationId,
    odsCode,
    messageId,
    repositoryAsid: initializeConfig().repositoryAsid
  };

  it('should call endpoint with nhs number and conversation id in the body', async () => {
    await sendHealthRecordAcknowledgement(nhsNumber, conversationId, odsCode, messageId);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(url, body, headers);
  });

  it('should throw an error when cannot send acknowledgement', async () => {
    axios.post.mockRejectedValue(new Error('Original error'));
    return expect(
      sendHealthRecordAcknowledgement(nhsNumber, conversationId, odsCode, messageId)
    ).rejects.toThrowError('Error sending EHR acknowledgement - axios error: Original error');
  });
});
