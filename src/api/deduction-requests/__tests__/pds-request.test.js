import request from 'supertest';
import { when } from 'jest-when';
import { updateLogEvent } from '../../../middleware/logging';
import { sendRetrievalRequest, sendUpdateRequest } from '../../../services/gp2gp';
import app from '../../../app';

jest.mock('../../../config/logging');
jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');
jest.mock('../../../services/gp2gp');

const retrievalResponse = {
  data: { serialChangeNumber: '123', patientPdsId: 'hello', nhsNumber: '1111111111' }
};

const invalidRetrievalResponse = {
  data: { serialChangeNumber: '123', patientPdsId: 'hellno', nhsNumber: '1111111112' }
};

function generateLogEvent(message) {
  return {
    status: 'validation-failed',
    validation: {
      errors: message,
      status: 'failed'
    }
  };
}

describe('POST /deduction-requests', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key';
    when(sendRetrievalRequest)
      .calledWith('1234567890')
      .mockResolvedValue({ status: 503, data: 'broken :(' })
      .calledWith('1111111111')
      .mockResolvedValue({ status: 200, data: retrievalResponse })
      .calledWith('1111111112')
      .mockResolvedValue({ status: 200, data: invalidRetrievalResponse });

    when(sendUpdateRequest)
      .calledWith('123', 'hello', '1111111111')
      .mockResolvedValue({ status: 204 })
      .calledWith('123', 'hellno', '1111111112')
      .mockResolvedValue({ status: 503, data: 'could not update ods code on pds' });
  });

  it('should return a 204 if :nhsNumber is numeric and 10 digits and Authorization Header provided', done => {
    request(app).post('/deduction-requests/1111111111').expect(204).end(done);
  });
  it('should return an error if :nhsNumber is less than 10 digits', done => {
    const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not 10 characters" }];
    request(app)
      .post('/deduction-requests/99')
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
      .post('/deduction-requests/xxxxxxxxxx')
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
  it('should return a 503 if sendRetrievalRequest throws an error', done => {
    request(app)
      .post('/deduction-requests/1234567890')
      .expect(res => {
        expect(res.status).toBe(503);
        expect(res.body.errors).toBe('Unexpected Error: broken :(');
      })
      .end(done);
  });
  it('should return a 503 if patient is retrieved but not updated', done => {
    request(app)
      .post('/deduction-requests/1111111112')
      .expect(503)
      .expect(res => {
        expect(res.body.errors).toBe('Failed to Update: could not update ods code on pds');
      })
      .end(done);
  });
});
