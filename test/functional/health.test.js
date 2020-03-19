import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import config from '../../src/config';

describe('/health', () => {
    const baseURL = (process.env.SERVICE_URL) ? process.env.SERVICE_URL : config.url;
    const healthUrl = `${baseURL}/health`;
    it('should return 200', () => {
        return expect(
            axios.get(`${healthUrl}`, {
                adapter
            })
        ).resolves.toEqual(expect.objectContaining({ status: 200 }));
    });

    it('health endpoint returns matching data', async () => {
        return expect(
            axios.get(`${healthUrl}`, {
                adapter
            })
        ).resolves.toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    version: '1',
                    description: 'Health of Deductions GP to Repo Component'
                })
            })
        );
    });
});
