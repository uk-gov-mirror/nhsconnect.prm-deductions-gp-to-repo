import request from 'supertest';
import { when } from 'jest-when';
import { message } from '../api/health';
import { sendRetrievalRequest, sendUpdateRequest } from '../services/gp2gp-service';
import app from '../app';
import config from '../config';
jest.mock('../config/logging');
jest.mock('../middleware/logging');
jest.mock('../services/gp2gp-service');

const retrievalResponse = {
  data: { serialChangeNumber: '123', patientPdsId: 'hello', nhsNumber: 1111111111 }
};

describe('app', () => {
  describe('GET /health', () => {
    it('should return a 200 status code', done => {
      request(app)
        .get('/health')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, { ...message, node_env: config.nodeEnv })
        .end(done);
    });
  });

  describe('POST /deduction-requests', () => {
    beforeEach(() => {
      process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';
      when(sendRetrievalRequest)
        .calledWith('1111111111')
        .mockResolvedValue({
          status: 200,
          data: retrievalResponse
        });
      when(sendUpdateRequest)
        .calledWith('123', 'hello', '1111111111')
        .mockResolvedValue({ status: 204 });
    });

    it('should return a 204 if :nhsNumber is numeric and 10 digits and Authorization Header provided', done => {
      request(app)
        .post('/deduction-requests/1111111111')
        .set('Authorization', 'correct-key')
        .expect(204)
        .end(done);
    });
  });
});
