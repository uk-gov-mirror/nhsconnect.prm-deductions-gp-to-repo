import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { initialiseConfig } from '../../../config';
import { checkEHRComplete } from '../ehr-details-request';
import { when } from 'jest-when';

jest.mock('axios');
jest.mock('../../../middleware/logging');
jest.mock('../../../config/');

const nhsNumber = '1111111111';
const conversationId = uuid();

const ehrBodyWithStatus = (status, conversationId) => {
  return {
    data: {
      type: 'health-record',
      id: conversationId,
      attributes: {
        status
      }
    }
  };
};

describe('checkEHRComplete', () => {
  initialiseConfig.mockReturnValue({
    ehrRepoUrl: 'ehr-repo-url',
    ehrRepoAuthKeys: 'secret'
  });

  const headers = { headers: { Authorization: `${initialiseConfig().ehrRepoAuthKeys}` } };
  const ehrRepoUrl = `${
    initialiseConfig().ehrRepoUrl
  }/patients/${nhsNumber}/health-records/${conversationId}`;

  it('should call axios with nhs number and resolve', async () => {
    const body = ehrBodyWithStatus('success', conversationId);
    when(axios.get).calledWith(ehrRepoUrl, headers).mockResolvedValue({ status: 200, data: body });
    const isEHRComplete = await checkEHRComplete(nhsNumber, conversationId);
    expect(isEHRComplete).toBe(true);
  });

  it('should call axios with nhs number and return false when status is pending', async () => {
    const body = ehrBodyWithStatus('pending', conversationId);
    when(axios.get).calledWith(ehrRepoUrl, headers).mockResolvedValue({ status: 200, data: body });

    const isEHRComplete = await checkEHRComplete(nhsNumber, conversationId);
    expect(isEHRComplete).toBe(false);
  });

  it('should throw an error when cannot retrieve deduction request', () => {
    axios.get.mockRejectedValue(new Error('Original error'));

    return expect(checkEHRComplete(nhsNumber, conversationId)).rejects.toThrowError(
      'Error retrieving EHR details - axios error: Original error'
    );
  });
});
