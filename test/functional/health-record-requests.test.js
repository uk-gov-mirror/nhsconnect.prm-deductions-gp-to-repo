import axios from 'axios';
import adapter from 'axios/lib/adapters/http';

describe('POST /health-record-requests/:nhsNumber', () => {
  it('should test successful POST request for /health-record-requests/:nhsNumber with Authorization', async () => {
    const nhsNumber = process.env.NHS_ENVIRONMENT === 'dev' ? '9473480032' : '9442964410';
    const postPromise = axios.post(
      `${process.env.SERVICE_URL}/health-record-requests/${nhsNumber}`,
      null,
      {
        headers: {
          Authorization: process.env.AUTHORIZATION_KEYS
        },
        adapter
      }
    );
    try {
      const res = await postPromise;
      expect(res.status).toBe(200);
    } catch (err) {
      console.log(err.toJSON());
      expect(err).toBe(null);
    }
  });
});
