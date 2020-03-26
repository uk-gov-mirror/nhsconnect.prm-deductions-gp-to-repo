import request from 'supertest';
import { message } from '../api/health';
import {
  sendRetrievalRequest,
  sendUpdateRequest,
  sendHealthRecordRequest
} from '../services/gp2gp';
import app from '../app';
import config from '../config';

jest.mock('../config/logging');
jest.mock('../middleware/logging');
jest.mock('../services/gp2gp');
jest.mock('../middleware/auth');

const retrievalResponse = {
  data: { serialChangeNumber: '123', patientPdsId: 'hello', nhsNumber: 1111111111 }
};

describe('app', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key';

    sendRetrievalRequest.mockResolvedValue({
      status: 200,
      data: retrievalResponse
    });

    sendUpdateRequest.mockResolvedValue({ status: 204 });

    sendHealthRecordRequest.mockResolvedValue({ status: 200 });
  });

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
    it('should return a 204 if :nhsNumber is numeric and 10 digits and Authorization Header provided', done => {
      request(app)
        .post('/deduction-requests/1111111111')
        .set('Authorization', 'correct-key')
        .expect(204)
        .end(done);
    });
  });

  describe('POST /health-record-requests/:nhsNumber', () => {
    it('should resolve the request', done => {
      request(app)
        .post('/health-record-requests/1111111111')
        .expect(200)
        .end(done);
    });
  });
});
