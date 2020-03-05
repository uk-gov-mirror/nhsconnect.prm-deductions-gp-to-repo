import request from 'supertest';
import { when } from 'jest-when';
import { message } from '../api/health';
import { sendRequest } from '../services/gp2gp-service';
import app from '../app';
import config from '../config';

jest.mock('../config/logging');
jest.mock('../middleware/logging');
jest.mock('../services/gp2gp-service');

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

  describe('POST /deduct-patient', () => {
    beforeEach(() => {
      process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';
      when(sendRequest)
        .mockResolvedValue({ status: 503, data: 'MHS error' })
        .calledWith('1111111111')
        .mockResolvedValue({ status: 200, data: message });
    });
  });
});
