import app from '../../app';
import request from 'supertest';
import { getHealthCheck } from '../../services/get-health-check';
import { updateLogEvent, updateLogEventWithError } from '../../middleware/logging';

jest.mock('../../config/logging');
jest.mock('../../services/get-health-check');
jest.mock('../../middleware/logging');

const mockErrorResponse = 'some-error';

describe('GET /health', () => {
  describe('all dependencies are available', () => {
    beforeEach(() => {
      getHealthCheck.mockReturnValue(Promise.resolve(expectedHealthCheckBase()));
    });

    it('should return HTTP status code 200', done => {
      request(app).get('/health').expect(200).end(done);
    });

    it('should return details of the response from getHealthCheck', done => {
      request(app)
        .get('/health')
        .expect(res => {
          expect(res.body).toEqual(expectedHealthCheckBase());
        })
        .end(done);
    });

    it('should call updateLogEvent with result when all dependencies are ok', done => {
      request(app)
        .get('/health')
        .expect(() => {
          expect(updateLogEvent).toHaveBeenCalledWith(
            expect.objectContaining({
              status: 'Health check completed'
            })
          );
        })
        .end(done);
    });
  });

  describe('database is not writable', () => {
    beforeEach(() => {
      getHealthCheck.mockReturnValue(Promise.resolve(expectedHealthCheckBase(false, true)));
    });

    it('should return 503 status if db writable is false', done => {
      request(app).get('/health').expect(503).end(done);
    });

    it('should return details of the response from getHealthCheck when the database writable is false', done => {
      request(app)
        .get('/health')
        .expect(res => {
          expect(res.body).toEqual(expectedHealthCheckBase(false, true));
        })
        .end(done);
    });

    it('should call updateLogEvent with the healthcheck result if db writable is false', done => {
      request(app)
        .get('/health')
        .expect(() => {
          expect(updateLogEvent).toHaveBeenCalledWith(expectedHealthCheckBase(false, true));
        })
        .end(done);
    });
  });

  describe('getHealthCheck throws error', () => {
    beforeEach(() => {
      getHealthCheck.mockRejectedValue(Error('some-error'));
    });

    it('should return 500 if getHealthCheck if it cannot provide a healthcheck', done => {
      request(app).get('/health').expect(500).end(done);
    });

    it('should updateLogEventWithError if getHealthCheck throws an error', done => {
      request(app)
        .get('/health')
        .expect(() => {
          expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
          expect(updateLogEventWithError).toHaveBeenCalledWith(Error('some-error'));
        })
        .end(done);
    });

    it('should update the log event for any unexpected error', done => {
      getHealthCheck.mockReturnValue(Promise.resolve(expectedHealthCheckBase(false)));

      request(app)
        .get('/health')
        .expect(() => {
          expect(updateLogEvent).toHaveBeenCalledTimes(2);
          expect(updateLogEvent).toHaveBeenCalledWith({ status: 'Health check completed' });
          expect(updateLogEvent).toHaveBeenCalledWith(expectedHealthCheckBase(false));
        })
        .end(done);
    });
  });
});

const expectedHealthCheckBase = (db_writable = true, db_connected = true) => ({
  details: {
    database: getExpectedDatabase(db_writable, db_connected)
  }
});

const getExpectedDatabase = (isWritable, isConnected) => {
  const baseConf = {
    connection: isConnected,
    writable: isWritable
  };

  return !isWritable
    ? {
        ...baseConf,
        error: mockErrorResponse
      }
    : baseConf;
};
