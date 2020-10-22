import request from 'supertest';
import { when } from 'jest-when';
import app from '../../../app';
import { sendHealthRecordRequest } from '../../../services/gp2gp';

jest.mock('../../../middleware/auth');
jest.mock('../../../services/gp2gp');

describe('POST /health-record-requests/:nhsNumber', () => {
  beforeEach(() => {
    when(sendHealthRecordRequest)
      .mockResolvedValue({ status: 200 })
      .calledWith('1222222222')
      .mockRejectedValue({ data: { errors: ['an-error'] } });
  });

  it('should resolve the request', done => {
    request(app).post('/health-record-requests/1111111111').expect(200).end(done);
  });

  it('should return a 422 if nhsNumber is not 10 digits', done => {
    request(app).post('/health-record-requests/123456').expect(422).end(done);
  });

  it('should return correct error message if nhsNumber is not 10 digits', done => {
    request(app)
      .post('/health-record-requests/123456')
      .expect(res => {
        expect(res.body).toEqual(
          expect.objectContaining({
            errors: expect.arrayContaining([{ nhsNumber: "'nhsNumber' provided is not 10 digits" }])
          })
        );
      })
      .end(done);
  });

  it('should return correct error message if nhsNumber is not numeric', done => {
    request(app)
      .post('/health-record-requests/xxxxxxxxxx')
      .expect(res => {
        expect(res.body).toEqual(
          expect.objectContaining({
            errors: expect.arrayContaining([{ nhsNumber: "'nhsNumber' provided is not numeric" }])
          })
        );
      })
      .end(done);
  });

  it('should return correct error message if nhsNumber is not numeric', done => {
    request(app)
      .post('/health-record-requests/1111111111')
      .expect(() => {
        expect(sendHealthRecordRequest).toHaveBeenCalledWith('1111111111');
        expect(sendHealthRecordRequest).toBeCalledTimes(1);
      })
      .end(done);
  });

  it('should return 200', done => {
    request(app).post('/health-record-requests/1111111111').expect(200).end(done);
  });

  it('should return 503 when error occurs', done => {
    request(app).post('/health-record-requests/1222222222').expect(503).end(done);
  });

  it('should return error message when error occurs', done => {
    request(app)
      .post('/health-record-requests/1222222222')
      .expect(res => {
        expect(res.body).toEqual(expect.objectContaining({ errors: ['an-error'] }));
      })
      .end(done);
  });
});
