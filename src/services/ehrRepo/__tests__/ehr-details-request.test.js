import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { checkEHRComplete } from '../ehr-details-request';

jest.mock('axios');
jest.mock('../../../middleware/logging');

describe('checkEHRComplete', () => {
  const nhsNumber = '1111111111';
  const conversationId = uuid();

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
