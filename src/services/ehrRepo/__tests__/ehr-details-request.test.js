import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { initialiseConfig } from '../../../config';
import { checkEHRComplete } from '../ehr-details-request';

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
  beforeEach(() => {
    initialiseConfig.mockReturnValue({
      useNewEhrRepoApi: false
    });
  });

  it('should call axios with nhs number and resolve', async () => {
    const body = ehrBodyWithStatus('success', conversationId);
    axios.get.mockResolvedValueOnce({ status: 200, data: body });
    const isEHRComplete = await checkEHRComplete(nhsNumber, conversationId);
    expect(isEHRComplete).toBe(true);
  });

  it('should call axios with nhs number and return false when status is pending', async () => {
    const body = ehrBodyWithStatus('pending', conversationId);
    axios.get.mockResolvedValueOnce({ status: 200, data: body });

    const isEHRComplete = await checkEHRComplete(nhsNumber, conversationId);
    expect(isEHRComplete).toBe(false);
  });

  it('should throw an error when cannot retrieve deduction request', () => {
    axios.get.mockRejectedValueOnce(new Error('Original error'));

    return expect(checkEHRComplete(nhsNumber, conversationId)).rejects.toThrowError(
      'Error retrieving EHR details - axios error: Original error'
    );
  });
});

describe('use new ehr repo api', () => {
  beforeEach(() => {
    initialiseConfig.mockReturnValue({
      useNewEhrRepoApi: true
    });
  });

  it('should call axios with nhs number and resolve', async () => {
    axios.get.mockResolvedValueOnce({ status: 200 });
    const isHealthRecordComplete = await checkEHRComplete(nhsNumber, conversationId);
    expect(isHealthRecordComplete).toBe(true);
  });

  it('should throw an error when cannot retrieve deduction request', async () => {
    axios.get.mockRejectedValueOnce(new Error('Original error'));
    return expect(checkEHRComplete(nhsNumber, conversationId)).rejects.toThrowError(
      'Error retrieving EHR details - axios error: Original error'
    );
  });
});
