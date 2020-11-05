import app from '../app';
import axios from 'axios';
import request from 'supertest';
import config from '../config';
import ModelFactory from '../models';
import { modelName, Status } from '../models/DeductionRequest';

jest.mock('axios');
jest.mock('../config/logging');

const retrievalResponse = {
  data: {
    serialChangeNumber: '123',
    patientPdsId: 'hello',
    nhsNumber: '1111111111',
    odsCode: 'B1234'
  }
};

const DeductionRequest = ModelFactory.getByName(modelName);

describe('app', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key';
    axios.get.mockImplementation(() => Promise.resolve({ status: 200, data: retrievalResponse }));
    axios.patch.mockImplementation(() => Promise.resolve({ status: 204, data: {} }));
    axios.post.mockImplementation(() => Promise.resolve({ status: 204, data: {} }));
  });

  afterEach(() => {
    if (process.env.AUTHORIZATION_KEYS) {
      delete process.env.AUTHORIZATION_KEYS;
    }
  });

  afterAll(async () => {
    await DeductionRequest.sequelize.sync({ force: true });
    await ModelFactory.sequelize.close();
  });

  describe('GET /', () => {
    it('should return a 404 status code', done => {
      request(app).get('/').expect(404).end(done);
    });
  });

  describe('GET /any-text - an unspecified endpoint', () => {
    it('should return a 404 status code', done => {
      request(app).get('/any-text').expect(404).end(done);
    });
  });

  describe('Swagger Documentation', () => {
    it('GET /swagger - should return a 301 status code (redirect) and text/html content type response', done => {
      request(app)
        .get('/swagger')
        .expect(301)
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .end(done);
    });

    it('GET /swagger/index.html - should return a 200 status code and text/html content type response', done => {
      request(app)
        .get('/swagger/index.html')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .end(done);
    });
  });

  describe('GET /health', () => {
    it('should return a 200 status code', done => {
      request(app)
        .get('/health')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          version: '1',
          description: 'Health of GP to Repo service',
          node_env: config.nodeEnv,
          details: {
            database: { type: 'postgresql', connection: true, writable: true }
          }
        })
        .end(done);
    });
  });

  describe('POST /deduction-requests/', () => {
    it('should return a 201 status code and empty body for /deduction-requests/', done => {
      request(app)
        .post('/deduction-requests/')
        .send({ nhsNumber: '1111111111' })
        .set('Authorization', 'correct-key')
        .expect(201)
        .expect(res => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });

    it('should return a 503 status code with Errors for /deduction-requests/', done => {
      axios.patch.mockImplementation(() =>
        Promise.resolve({ status: 200, data: 'incorrect data!' })
      );

      request(app)
        .post('/deduction-requests/')
        .send({ nhsNumber: '9999999999' })
        .set('Authorization', 'correct-key')
        .expect(503)
        .expect(res => {
          expect(res.body).toEqual({ errors: 'Failed to Update: incorrect data!' });
        })
        .end(done);
    });

    it('should return a 422 status code without nhsNumber in body', done => {
      request(app)
        .post('/deduction-requests/')
        .set('Authorization', 'correct-key')
        .expect(422)
        .end(done);
    });
  });

  describe('GET /deduction-requests/:conversationId', () => {
    const conversationId = 'e12d49fb-6827-4648-8ec8-a951f3cf6ac0';
    const expectedNhsNumber = '1234567890';
    const expectedStatus = Status.PDS_UPDATE_SENT;

    it('should return deduction request info', async done => {
      await DeductionRequest.create({
        conversation_id: conversationId,
        nhs_number: expectedNhsNumber,
        status: expectedStatus,
        ods_code: 'something'
      });

      request(app)
        .get(`/deduction-requests/${conversationId}`)
        .set('Authorization', 'correct-key')
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual({
            data: {
              type: 'deduction-requests',
              id: conversationId,
              attributes: {
                nhsNumber: expectedNhsNumber,
                status: expectedStatus
              }
            }
          });
        })
        .end(done);
    });

    it('should return 404 when deduction request cannot be found', done => {
      const invalidConversationId = '58eff803-48f3-4a30-8189-632141bd823d';
      request(app)
        .get(`/deduction-requests/${invalidConversationId}`)
        .set('Authorization', 'correct-key')
        .expect(404)
        .end(done);
    });
  });

  describe('PATCH /deduction-requests/:conversationId/pds-update', () => {
    const conversationId = 'dad8fe6d-f525-4961-b086-bb9730a4822f';
    const expectedNhsNumber = '1234567891';
    const expectedStatus = Status.PDS_UPDATE_SENT;
    const odsCode = 'B1234';

    it('should return 204 upon successful deduction request PDS update', async done => {
      await DeductionRequest.create({
        conversation_id: conversationId,
        nhs_number: expectedNhsNumber,
        status: expectedStatus,
        ods_code: odsCode
      });

      request(app)
        .patch(`/deduction-requests/${conversationId}/pds-update`)
        .set('Authorization', 'correct-key')
        .expect(204)
        .expect(res => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  });
});
