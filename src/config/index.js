const portNumber = 3000;

const config = {
  nodeEnv: process.env.NODE_ENV,
  gp2gpUrl: process.env.GP2GP_URL,
  gp2gpAuthKeys: process.env.GP2GP_AUTHORIZATION_KEYS,
  url:
    process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test'
      ? `http://127.0.0.1:${portNumber}`
      : `http://${process.env.NODE_ENV}.gp-to-repo.patient-deductions.nhs.uk`
};

export default config;
export { portNumber };
