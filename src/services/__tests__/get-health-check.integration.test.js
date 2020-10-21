import { getHealthCheck } from '../get-health-check';
import ModelFactory from '../../models';

describe('getHealthCheck', () => {
  beforeEach(() => {
    ModelFactory._resetConfig();
  });

  afterAll(() => {
    ModelFactory.sequelize.close();
  });

  it('should return successful db health check if db connection is healthy', () => {
    return getHealthCheck().then(result => {
      const db = result.details['database'];
      return expect(db).toEqual({
        type: 'postgresql',
        connection: true,
        writable: true
      });
    });
  });

  it('should return failed db health check if username is incorrect', () => {
    ModelFactory._overrideConfig('username', 'wrong-username');

    return getHealthCheck().then(result => {
      const db = result.details['database'];

      return expect(db).toEqual({
        type: 'postgresql',
        connection: true,
        writable: false,
        error: 'Authorization error (Error Code: 28P01)'
      });
    });
  });

  it('should return failed db health check if there is an unknown error', () => {
    ModelFactory._overrideConfig('host', 'something');

    return getHealthCheck().then(result => {
      const db = result.details['database'];

      return expect(db).toEqual({
        type: 'postgresql',
        connection: false,
        writable: false,
        error: 'Unknown error (Error Code: ENOTFOUND)'
      });
    });
  });
});
