import { initializeConfig } from '..';

describe('config', () => {
  let repositoryOdsCode;
  let serviceUrl;
  let repositoryAsid;

  beforeEach(() => {
    repositoryOdsCode = process.env.REPOSITORY_ODS_CODE;
    serviceUrl = process.env.SERVICE_URL;
    repositoryAsid = process.env.REPOSITORY_ASID;
  });

  afterEach(() => {
    process.env.REPOSITORY_ODS_CODE = repositoryOdsCode;
    process.env.SERVICE_URL = serviceUrl;
    process.env.REPOSITORY_ASID = repositoryAsid;
  });

  it('repository ods code is the correct value when environment variable is set', () => {
    process.env.REPOSITORY_ODS_CODE = 'something';
    expect(initializeConfig().repositoryOdsCode).toEqual('something');
  });

  it('service url defaults to the correct value when environment variables not set', () => {
    if (process.env.SERVICE_URL) delete process.env.SERVICE_URL;
    expect(initializeConfig().url).toEqual(`http://127.0.0.1:3000`);
  });

  it('service url is the correct value when environment variables are set', () => {
    process.env.SERVICE_URL = 'url';
    expect(initializeConfig().url).toEqual(`url`);
  });

  it('repository asid is the correct value when environment variables are set', () => {
    process.env.REPOSITORY_ASID = 'repo-asid';
    expect(initializeConfig().repositoryAsid).toEqual('repo-asid');
  });

  it('nhs Environment is the correct value when environment variables are set', () => {
    process.env.NHS_ENVIRONMENT = 'local';
    expect(initializeConfig().nhsEnvironment).toEqual('local');
  });
});
