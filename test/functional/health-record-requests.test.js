import axios from 'axios';
import adapter from 'axios/lib/adapters/http';

describe('POST /health-record-requests/:nhsNumber', () => {
    it('should test successful POST request for /health-record-requests/:nhsNumber with Authorization', () => {
        const nhsNumber =
            process.env.NHS_ENVIRONMENT === 'dev' ? "9473480032" : "9442964410";
        return expect(
            axios.post(`${process.env.SERVICE_URL}/health-record-requests/${nhsNumber}`, null, {
                headers: {
                    Authorization: process.env.AUTHORIZATION_KEYS.split(',')[0]
                },
                adapter
            })
        ).resolves.toEqual(
            expect.objectContaining({
                status: 200
            }));
    });
});