import { checkDbHealth } from './database/check-db-health';
import { logEvent } from '../middleware/logging';
import config from '../config';

export function getHealthCheck() {
  logEvent('Starting health check');

  return checkDbHealth().then(db => {
    logEvent('Database health check', { db });
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
