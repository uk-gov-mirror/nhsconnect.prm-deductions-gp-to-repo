import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { initialiseConfig } from '../../../config/index';
import { sendHealthRecordAcknowledgement } from '../health-record-acknowledgement';

jest.mock('../../../middleware/logging');
jest.mock('axios');
jest.mock('../../../config/');

const nhsNumber = '1111111111';
const conversationId = uuid();
const odsCode = 'B12345';

describe('sendHealthRecordAcknowledgement', () => {
  initialiseConfig.mockReturnValue({
    gp2gpUrl: 'gp2gp-url',
    gp2gpAuthKeys: 'secret'
  });

  const headers = { headers: { Authorization: `${initialiseConfig().gp2gpAuthKeys}` } };
  const url = `${initialiseConfig().gp2gpUrl}/health-record-requests/${nhsNumber}/acknowledgement`;
  const body = { conversationId, odsCode };

  it('should call endpoint with nhs number and conversation id in the body', async () => {
    await sendHealthRecordAcknowledgement(nhsNumber, conversationId, odsCode);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(url, body, headers);
  });

  it('should throw an error when cannot send acknowledgement', async () => {
    axios.post.mockRejectedValue(new Error('Original error'));
    return expect(
      sendHealthRecordAcknowledgement(nhsNumber, conversationId, odsCode)
    ).rejects.toThrowError('Error sending EHR acknowledgement - axios error: Original error');
  });
});
