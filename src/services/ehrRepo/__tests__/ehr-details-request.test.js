import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { initialiseConfig } from '../../../config';
import { checkEHRComplete } from '../ehr-details-request';

jest.mock('axios');
jest.mock('../../../middleware/logging');
jest.mock('../../../config/');

const nhsNumber = '1111111111';
const conversationId = uuid();

describe('checkEHRComplete', () => {
  initialiseConfig.mockReturnValue({
    ehrRepoUrl: 'ehr-repo-url',
    ehrRepoAuthKeys: 'secret'
  });

  it('should call axios with nhs number and resolve', () => {
    axios.get.mockResolvedValue({ status: 200 });

    return checkEHRComplete(nhsNumber, conversationId).then(response => {
      expect(response.status).toBe(200);
      expect(axios.get).toBeCalledWith(
        `${initialiseConfig().ehrRepoUrl}/patients/${nhsNumber}/health-record/${conversationId}`,
        { headers: { Authorization: `${initialiseConfig().ehrRepoAuthKeys}` } }
      );
    });
  });

  it('should throw an error when cannot retrieve deduction request', () => {
    axios.get.mockRejectedValue(new Error());

    return expect(checkEHRComplete(nhsNumber, conversationId)).rejects.toThrowError();
  });
});
