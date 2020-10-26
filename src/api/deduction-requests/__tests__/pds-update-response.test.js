import request from 'supertest';
import app from '../../../app';
import { sendHealthRecordRequest } from '../../../services/gp2gp';

jest.mock('../../../middleware/auth');
jest.mock('../../../middleware/logging');
jest.mock('../../../services/gp2gp/health-record-request', () => ({
  sendHealthRecordRequest: jest.fn()
}));

const expectedNhsNumber = '1234567890';

describe('PATCH /deduction-requests/:conversationId/pds-update', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key';
  });

  const conversationId = 'b3e0cfe6-7401-4ced-b5b3-34862d602c28';
  it('should call sendHealthRecordRequest with nhs number and return a 204', done => {
    request(app)
      .patch(`/deduction-requests/${conversationId}/pds-update`)
      .expect(() => {
        expect(sendHealthRecordRequest).toHaveBeenCalledWith(expectedNhsNumber);
      })
      .expect(204)
      .end(done);
  });

  it('should return a 503', done => {
    sendHealthRecordRequest.mockRejectedValue({ errors: ['error'] });
    request(app).patch(`/deduction-requests/${conversationId}/pds-update`).expect(503).end(done);
  });
});
