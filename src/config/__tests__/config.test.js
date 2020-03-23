import { initialiseConfig } from '..';

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

  it('repository ods code defaults to the correct value when environment variables not set', () => {
    if (process.env.REPOSITORY_ODS_CODE) delete process.env.REPOSITORY_ODS_CODE;
    expect(initialiseConfig().repositoryOdsCode).toEqual('B86041');
  });

  it('repository ods code is the correct value when environment variable is set', () => {
    process.env.REPOSITORY_ODS_CODE = 'something';
    expect(initialiseConfig().repositoryOdsCode).toEqual('something');
  });

  it('service url defaults to the correct value when environment variables not set', () => {
    if (process.env.SERVICE_URL) delete process.env.SERVICE_URL;
    expect(initialiseConfig().url).toEqual(`http://127.0.0.1:3000`);
  });

  it('service url is the correct value when environment variables are set', () => {
    process.env.SERVICE_URL = 'url';
    expect(initialiseConfig().url).toEqual(`url`);
  });

  it('repository asid defaults to the correct value when environment variables not set', () => {
    if (process.env.REPOSITORY_ASID) delete process.env.REPOSITORY_ASID;
    expect(initialiseConfig().repositoryAsid).toEqual('200000001161');
  });

  it('repository asid is the correct value when environment variables are set', () => {
    process.env.REPOSITORY_ASID = 'repo-asid';
    expect(initialiseConfig().repositoryAsid).toEqual('repo-asid');
  });
});
