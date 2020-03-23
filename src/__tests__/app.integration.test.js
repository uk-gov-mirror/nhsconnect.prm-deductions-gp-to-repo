import axios from 'axios';
import request from 'supertest';
import app from '../app';
import config from '../config';
import { message } from '../api/health';

jest.mock('../config/logging');
jest.mock('axios');

const retrievalResponse = {
  data: { serialChangeNumber: '123', patientPdsId: 'hello', nhsNumber: '1111111111' }
};

describe('app', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';
    axios.get.mockImplementation(() => Promise.resolve({ status: 200, data: retrievalResponse }));
    axios.patch.mockImplementation(() => Promise.resolve({ status: 204, data: {} }));
  });

  afterEach(() => {
    if (process.env.AUTHORIZATION_KEYS) {
      delete process.env.AUTHORIZATION_KEYS;
    }
  });

  describe('GET /', () => {
    it('should return a 404 status code', done => {
      request(app)
        .get('/')
        .expect(404)
        .end(done);
    });
  });

  describe('GET /any-text - an unspecified endpoint', () => {
    it('should return a 404 status code', done => {
      request(app)
        .get('/any-text')
        .expect(404)
        .end(done);
    });
  });

  describe('Swagger Documentation', () => {
    it('GET /swagger - should return a 301 status code (redirect) and text/html content type response', done => {
      request(app)
        .get('/swagger')
        .expect(301)
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .end(done);
    });

    it('GET /swagger/index.html - should return a 200 status code and text/html content type response', done => {
      request(app)
        .get('/swagger/index.html')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .end(done);
    });
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

  describe('POST /deduction-requests/:nhsNumber', () => {
    it('should return a 204 status code and empty body for /deduction-requests/:nhsNumber', done => {
      request(app)
        .post('/deduction-requests/1111111111')
        .set('Authorization', 'correct-key')
        .expect(204)
        .expect(res => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });

    it('should return a 503 status code with Errors for /deduction-requests/:nhsNumber', done => {
      axios.patch.mockImplementation(() =>
        Promise.resolve({ status: 200, data: 'incorrect data!' })
      );

      request(app)
        .post('/deduction-requests/9999999999')
        .set('Authorization', 'correct-key')
        .expect(503)
        .expect(res => {
          expect(res.body).toEqual({ errors: 'Failed to Update: incorrect data!' });
        })
        .end(done);
    });

    it('should return a 404 status code without nhsNumber parameter', done => {
      request(app)
        .post('/deduction-requests')
        .expect(404)
        .end(done);
    });
  });

  describe('POST /health-record-requests/:nhsNumber', () => {
    it('should return a 401 when authorization is not provided', done => {
      request(app)
        .post('/health-record-requests/1111111111')
        .expect(401)
        .end(done);
    });
  });
});
