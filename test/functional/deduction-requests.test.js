import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import config from '../../src/config';

describe('End to end test of /deduction-requests/:nhsNumber', () => {
    it('should return a 204 from GP2GP Adaptor with a valid NHS number', () => {
        const nhsNumber =
            process.env.NHS_ENVIRONMENT === 'dev' ? "9473480032" : "9442964410";

        return expect(
            axios.post(`${config.url}/deduction-requests/${nhsNumber}`, {
                headers: {
                    Authorization: process.env.AUTHORIZATION_KEYS.split(',')[0]
                },
                adapter
            })
        ).resolves.toEqual(
            expect.objectContaining({
                status: 204
            })
        );
    });
});