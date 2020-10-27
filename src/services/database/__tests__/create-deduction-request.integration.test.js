import ModelFactory from '../../../models';
import { createDeductionRequest } from '../create-deduction-request';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import { runWithinTransaction } from '../helper';
import { v4 as uuid } from 'uuid';

jest.mock('../../../middleware/logging');

describe('createDeductionRequest', () => {
  const nhsNumber = '1234567890';
  const odsCode = 'B1234';
  const DeductionRequests = ModelFactory.getByName('DeductionRequests');
  afterAll(() => {
    ModelFactory.sequelize.close();
  });

  it('should call updateLogEvent if data persisted correctly', () => {
    const conversationId = uuid();
    return createDeductionRequest(conversationId, nhsNumber, odsCode).then(() => {
      expect(updateLogEvent).toHaveBeenCalledTimes(1);
      return expect(updateLogEvent).toHaveBeenCalledWith({
        status: 'Deduction request has been stored'
      });
    });
  });

  it('should create deduction request with correct values', async () => {
    const conversationId = uuid();
    await createDeductionRequest(conversationId, nhsNumber, odsCode);
    const deductionRequest = await runWithinTransaction(transaction =>
      DeductionRequests.findOne({
        where: {
          conversation_id: conversationId
        },
        transaction: transaction
      })
    );
    expect(deductionRequest).not.toBeNull();
    expect(deductionRequest.get().conversation_id).toBe(conversationId);
    expect(deductionRequest.get().nhs_number).toBe(nhsNumber);
  });

  it('should log errors when nhs number is invalid', () => {
    const conversationId = uuid();
    return createDeductionRequest(conversationId, '123', odsCode).catch(error => {
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(error);
      return expect(error.message).toContain('Validation len on nhs_number failed');
    });
  });

  it('should log errors when conversationId is invalid', () => {
    return createDeductionRequest('invalid-conversation-id', nhsNumber, odsCode).catch(error => {
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(error);
      return expect(error.message).toContain(
        'invalid input syntax for type uuid: "invalid-conversation-id"'
      );
    });
  });
});
