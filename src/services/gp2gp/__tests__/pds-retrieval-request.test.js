import axios from 'axios';
import config from '../../../config';
import { sendRetrievalRequest } from '../pds-retrieval-request';

jest.mock('../../../config/logging');
jest.mock('../../../middleware/logging');
jest.mock('axios');

const mockNhsNumber = '01234567890';
const axiosHeaders = {
  headers: {
    Authorization: config.gp2gpAuthKeys
  }
};

describe('sendRetrievalRequest', () => {
  it('should call axios with nhs number by default and return 200', () => {
    axios.get.mockResolvedValue({ status: 200 });

    return sendRetrievalRequest(mockNhsNumber).then(response => {
      expect(response.status).toBe(200);
      expect(axios.get).toBeCalledWith(
        `${config.gp2gpUrl}/patient-demographics/${mockNhsNumber}`,
        axiosHeaders
      );
    });
  });

  it('should call logError if there is an error with axios.get request', () => {
    axios.get.mockRejectedValue(new Error());

    return expect(sendRetrievalRequest(mockNhsNumber)).rejects.toThrowError(
      `GET ${config.gp2gpUrl}/patient-demographics/${mockNhsNumber} - Request failed`
    );
  });

  it('should call logError if there is a 503 with axios.get request', () => {
    axios.get.mockRejectedValue({ response: { status: 503 } });

    return expect(sendRetrievalRequest(mockNhsNumber)).rejects.toThrowError(
      `GET ${config.gp2gpUrl}/patient-demographics/${mockNhsNumber} - Request failed`
    );
  });
});
