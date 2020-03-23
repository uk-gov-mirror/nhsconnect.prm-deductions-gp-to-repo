import request from 'supertest';
import app from '../../app';
import axios from 'axios';

jest.mock('../../middleware/auth');
jest.mock('axios');

describe('POST /health-record-requests/:nhsNumber', () => {
    it('should return 200', done => {
        axios.post.mockResolvedValue({ status: 200, data: {} });
        request(app)
            .post('/health-record-requests/1111111111')
            .expect(200)
            .end(done);
    });

    it('should return 503 when errors', done => {
        axios.post.mockRejectedValue({ status: 503, data: { errors: ['some-error'] } });
        request(app)
            .post('/health-record-requests/1111111111')
            .expect(503)
            .end(done);
    });

    it('should return correct error message when errors', done => {
        axios.post.mockRejectedValue({ status: 503, data: { errors: ['some-error'] } });
        request(app)
            .post('/health-record-requests/1111111111')
            .expect(res => {
                expect(res.body).toEqual(expect.objectContaining({ errors: ['some-error'] }));
            })
            .end(done);
    });
});