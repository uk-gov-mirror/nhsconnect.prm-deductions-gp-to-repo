const portNumber = 3000;

const config = {
  nodeEnv: process.env.NODE_ENV,
  gp2gpUrl: process.env.GP2GP_URL,
  gp2gpAuthKeys: process.env.GP2GP_AUTHORIZATION_KEYS,
  url: process.env.SERVICE_URL || `http://localhost:${portNumber}`
};

export default config;
export { portNumber };
