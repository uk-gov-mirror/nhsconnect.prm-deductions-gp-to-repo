import axios from 'axios';
import config from '../../config';
import { sendRetrievalRequest, sendUpdateRequest } from '../../services/gp2gp-service';

jest.mock('../../config/logging');
jest.mock('../../middleware/logging');
jest.mock('axios');

const mockNhsNumber = '01234567890';
const serialChangeNumber = '13';
const pdsId = 'hello';

const axiosHeaders = {
  headers: {
    Authorization: config.gp2gpAuthKeys
  }
};

const axiosBody = {
  serialChangeNumber,
  pdsId
};

describe('gp2gp-adaptor', () => {
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

    it('should call updateLogEventWithError if there is an error with axios.get request', () => {
      axios.get.mockRejectedValue(new Error());

      return expect(sendRetrievalRequest(mockNhsNumber)).rejects.toThrowError(
        `GET ${config.gp2gpUrl}/patient-demographics/${mockNhsNumber} - Request failed`
      );
    });
  });

  describe('sendUpdateRequest', () => {
    it('should call axios with nhs number by default and return 204', () => {
      axios.patch.mockResolvedValue({ status: 204 });

      return sendUpdateRequest(serialChangeNumber, pdsId, mockNhsNumber).then(response => {
        expect(response.status).toBe(204);
        expect(axios.patch).toBeCalledWith(
          `${config.gp2gpUrl}/patient-demographics/${mockNhsNumber}`,
          axiosBody,
          axiosHeaders
        );
      });
    });

    it('should call updateLogEventWithError if there is an error with axios.patch request', () => {
      axios.patch.mockRejectedValue(new Error());

      return expect(
        sendUpdateRequest(serialChangeNumber, pdsId, mockNhsNumber)
      ).rejects.toThrowError(
        `PATCH ${config.gp2gpUrl}/patient-demographics/${mockNhsNumber} - Request failed`
      );
    });
  });
});
