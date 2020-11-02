import request from 'supertest';
import { when } from 'jest-when';
import { v4 as uuid } from 'uuid';
import { updateLogEvent } from '../../../middleware/logging';
import { sendRetrievalRequest, sendUpdateRequest } from '../../../services/gp2gp';
import { createDeductionRequest } from '../../../services/database/create-deduction-request';
import { updateDeductionRequestStatus } from '../../../services/database/deduction-request-repository';
import config from '../../../config';
import app from '../../../app';
import { Status } from '../../../models/DeductionRequest';

jest.mock('../../../config/logging');
jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');
jest.mock('../../../services/gp2gp');
jest.mock('../../../services/database/create-deduction-request');
jest.mock('../../../services/database/deduction-request-repository');
jest.mock('uuid');
const oldConfig = config;
const conversationId = 'c9b24d61-f5b0-4329-a731-e73064d89832';
uuid.mockImplementation(() => conversationId);

const retrievalResponse = {
  data: {
    serialChangeNumber: '123',
    patientPdsId: 'hello',
    nhsNumber: '1111111111',
    odsCode: 'B1234'
  }
};

const invalidRetrievalResponse = {
  data: {
    serialChangeNumber: '123',
    patientPdsId: 'hellno',
    nhsNumber: '1111111112',
    odsCode: 'C1234'
  }
};

function generateLogEvent(message) {
  return {
    status: 'validation-failed',
    validation: {
      errors: message,
      status: 'failed'
    }
  };
}

describe('POST /deduction-requests/', () => {
  beforeEach(() => {
    config.url = 'fake-url';
    when(sendRetrievalRequest)
      .calledWith('1234567890')
      .mockImplementation(() => {
        throw new Error('Cannot retrieve patient');
      })
      .calledWith('1111111111')
      .mockResolvedValue({ status: 200, data: retrievalResponse })
      .calledWith('1111111112')
      .mockResolvedValue({ status: 200, data: invalidRetrievalResponse });

    when(sendUpdateRequest)
      .calledWith('123', 'hello', '1111111111', conversationId)
      .mockResolvedValue({ status: 204, data: { response: 'data' } })
      .calledWith('123', 'hellno', '1111111112', conversationId)
      .mockResolvedValue({ status: 503, data: 'could not update ods code on pds' });
  });

  afterEach(() => {
    config.url = oldConfig.url;
  });

  it('should return a 201 if :nhsNumber is numeric and 10 digits and Authorization Header provided', async done => {
    request(app)
      .post('/deduction-requests/')
      .send({ nhsNumber: '1111111111' })
      .expect(201)
      .expect(res => {
        expect(res.header.location).toBe(`${config.url}/deduction-requests/${conversationId}`);
      })
      .end(done);
  });
  it('should call createDeductionRequest when patient is found in pds', async done => {
    request(app)
      .post('/deduction-requests/')
      .send({ nhsNumber: '1111111111' })
      .expect(() => {
        expect(createDeductionRequest).toHaveBeenCalledWith(conversationId, '1111111111', 'B1234');
      })
      .end(done);
  });
  it('should sendUpdateRequest with correct info when patient is found in PDS', done => {
    request(app)
      .post('/deduction-requests/')
      .send({ nhsNumber: '1111111111' })
      .expect(() => {
        expect(sendUpdateRequest).toHaveBeenCalledWith(
          '123',
          'hello',
          '1111111111',
          conversationId
        );
      })
      .end(done);
  });
  it('should update the status of the deduction request to pds_update_sent when pds retrieval and update are successful', done => {
    const status = Status.PDS_UPDATE_SENT;
    request(app)
      .post('/deduction-requests/')
      .send({ nhsNumber: '1111111111' })
      .expect(() => {
        expect(updateDeductionRequestStatus).toHaveBeenCalledWith(conversationId, status);
      })
      .end(done);
  });
  it('should not update the status of updateDeductionsRequest when pds retrieval and update are not successful', done => {
    request(app)
      .post('/deduction-requests/')
      .send({ nhsNumber: '1111111112' })
      .expect(() => {
        expect(updateDeductionRequestStatus).not.toHaveBeenCalled();
      })
      .end(done);
  });
  it('should return an error if :nhsNumber is less than 10 digits', done => {
    const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not 10 characters" }];
    request(app)
      .post('/deduction-requests/')
      .send({ nhsNumber: '111111' })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(updateLogEvent).toHaveBeenCalledTimes(1);
        expect(updateLogEvent).toHaveBeenCalledWith(generateLogEvent(errorMessage));
      })
      .end(done);
  });
  it('should return an error if :nhsNumber is not numeric', done => {
    const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not numeric" }];
    request(app)
      .post('/deduction-requests/')
      .send({ nhsNumber: 'xxxxxxxxxx' })
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(updateLogEvent).toHaveBeenCalledTimes(1);
        expect(updateLogEvent).toHaveBeenCalledWith(generateLogEvent(errorMessage));
      })
      .end(done);
  });
  it('should return a 503 if sendRetrievalRequest throws an error', done => {
    request(app)
      .post('/deduction-requests/')
      .send({ nhsNumber: '1234567890' })
      .expect(res => {
        expect(res.status).toBe(503);
        expect(res.body.errors).toBe('Cannot retrieve patient');
      })
      .end(done);
  });
  it('should not call createDeductionRequest if patient not found in PDS', done => {
    request(app)
      .post('/deduction-requests/')
      .send({ nhsNumber: '1234567890' })
      .expect(() => {
        expect(createDeductionRequest).not.toHaveBeenCalled();
      })
      .end(done);
  });
  it('should return a 503 if patient is retrieved but not updated', done => {
    request(app)
      .post('/deduction-requests/')
      .send({ nhsNumber: '1111111112' })
      .expect(503)
      .expect(res => {
        expect(res.body.errors).toBe('Failed to Update: could not update ods code on pds');
      })
      .end(done);
  });
});
