import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import config from '../src/config';

describe('Smoke test', () => {
  it('health endpoint returns matching data', async () => {

    const baseURL = (process.env.GPTOREPO_URL) ? process.env.GPTOREPO_URL : config.url;

    const healthUrl = `${baseURL}/health`;
    const res = await axios.get(healthUrl, {
      adapter
    });

    expect(res.data).toEqual(expect.objectContaining({
      description: "Health of Deductions GP to Repo Component",
      status: "running",
      version: "1",
    }));
  });
});
