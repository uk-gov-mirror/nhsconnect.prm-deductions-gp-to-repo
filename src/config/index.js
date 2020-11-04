import sequelizeConfig from './database';

const portNumber = 3000;

export const initialiseConfig = () => ({
  nodeEnv: process.env.NODE_ENV,
  gp2gpUrl: process.env.GP2GP_URL,
  gp2gpAuthKeys: process.env.GP2GP_AUTHORIZATION_KEYS,
  repositoryOdsCode: process.env.REPOSITORY_ODS_CODE || 'B86041',
  repositoryAsid: process.env.REPOSITORY_ASID || '200000001161',
  practiceAsid: '200000000149',
  url: process.env.SERVICE_URL || `http://127.0.0.1:${portNumber}`,
  sequelize: sequelizeConfig
});

export default initialiseConfig();
export { portNumber };
