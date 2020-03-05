import request from 'supertest';
import { when } from 'jest-when';
import { updateLogEvent } from '../middleware/logging';
import { message } from '../api/health';
import { sendRequest } from '../services/gp2gp-service';
import app from '../app';
import config from '../config';

jest.mock('../config/logging');
jest.mock('../middleware/logging');
jest.mock('../services/gp2gp-service');

function generateLogEvent(message) {
  return {
    status: 'validation-failed',
    validation: {
      errors: message,
      status: 'failed'
    }
  };
}

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

    it('should return a 200 if :nhsNumber is numeric and 10 digits and Authorization Header provided', done => {
      request(app)
        .post('/deduct-patient/1111111111')
        .set('Authorization', 'correct-key')
        .expect(200)
        .end(done);
    });
    it('should return a 401 when no authorization header provided', done => {
      request(app)
        .post('/deduct-patient/1111111111')
        .expect(401)
        .end(done);
    });
    it('should return a 403 when authorization key is incorrect', done => {
      request(app)
        .post('/deduct-patient/1111111111')
        .set('Authorization', 'incorrect-key')
        .expect(403)
        .end(done);
    });
    it('should return an error if :nhsNumber is less than 10 digits', done => {
      const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not 10 characters" }];
      request(app)
        .post('/deduct-patient/99')
        .set('Authorization', 'correct-key')
        .expect(422)
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.body).toEqual({
            errors: errorMessage
          });
          expect(updateLogEvent).toHaveBeenCalledTimes(1);
          expect(updateLogEvent).toHaveBeenCalledWith(generateLogEvent(errorMessage));
        })
        .end(done);
    });
    it('should return an error if :nhsNumber is not numeric', done => {
      const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not numeric" }];
      request(app)
        .post('/deduct-patient/xxxxxxxxxx')
        .set('Authorization', 'correct-key')
        .expect(422)
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.body).toEqual({
            errors: errorMessage
          });
          expect(updateLogEvent).toHaveBeenCalledTimes(1);
          expect(updateLogEvent).toHaveBeenCalledWith(generateLogEvent(errorMessage));
        })
        .end(done);
    });
  });
});
