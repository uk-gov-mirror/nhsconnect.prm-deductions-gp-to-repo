import { checkDbHealth } from './database/check-db-health';
import { updateLogEvent } from '../middleware/logging';
import config from '../config';

export function getHealthCheck() {
  updateLogEvent({ status: 'Starting health check' });

  return checkDbHealth().then(db => {
    updateLogEvent({ db });
    return {
      version: '1',
      description: 'Health of GP to Repo service',
      node_env: config.nodeEnv,
      details: {
        database: db
      }
    };
  });
}
