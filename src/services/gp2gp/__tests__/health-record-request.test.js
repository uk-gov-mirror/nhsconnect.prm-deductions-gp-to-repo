import axios from 'axios';
import { sendHealthRecordRequest } from '../health-record-request';
import config from '../../../config';

jest.mock('axios');
jest.mock('../../../middleware/logging');

const oldConfig = config;
describe('sendHealthRecordRequest', () => {
  beforeEach(() => {
    axios.post.mockResolvedValue({ status: 200, body: {} });

    config.repositoryOdsCode = 'repo_ods_code';
    config.gp2gpAuthKeys = 'auth_keys';
  });

  afterEach(() => {
    config.repositoryOdsCode = oldConfig.repositoryOdsCode;
    config.gp2gpAuthKeys = oldConfig.gp2gpAuthKeys;
  });

  it('should call axios with nhs number and resolve', () => {
    return expect(sendHealthRecordRequest('1111111111')).resolves.toEqual(
      expect.objectContaining({ status: 200 })
    );
  });

  it('should fail to send the request when the require body parameters are not sent', () => {
    axios.post.mockRejectedValue({
      errors: [{ repositoryOdsCode: "'repositoryOdsCode' is not configured" }]
    });
    return expect(sendHealthRecordRequest('1111111111')).rejects.toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          { repositoryOdsCode: "'repositoryOdsCode' is not configured" }
        ])
      })
    );
  });

  it('should call axios post with body parameter repository ODS code', async done => {
    await sendHealthRecordRequest('1111111111');
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        repositoryOdsCode: config.repositoryOdsCode
      }),
      expect.anything()
    );
    done();
  });

  it('should call axios post with body parameter repository asid', async done => {
    await sendHealthRecordRequest('1111111111');
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        repositoryAsid: config.repositoryAsid
      }),
      expect.anything()
    );
    done();
  });

  it('should call axios post with body parameter practice ODS code', async done => {
    await sendHealthRecordRequest('1111111111');
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        practiceOdsCode: config.practiceOdsCode
      }),
      expect.anything()
    );
    done();
  });

  it('should call axios post with body parameter practice asid', async done => {
    await sendHealthRecordRequest('1111111111');
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        practiceAsid: config.practiceAsid
      }),
      expect.anything()
    );
    done();
  });

  it('should call axios post with authorization header', async done => {
    await sendHealthRecordRequest('1111111111');
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: config.gp2gpAuthKeys
        })
      })
    );
    done();
  });
});
