import ModelFactory from '../../../models';
import { createDeductionRequest } from '../create-deduction-request';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';

jest.mock('../../../middleware/logging');

describe('createDeductionRequest', () => {
  const nhsNumber = '1234567890';
  const conversationId = '099cd501-034f-4e17-a461-cf4fd93ae0cf';
  const odsCode = 'B1234';

  afterAll(() => {
    ModelFactory.sequelize.close();
  });

  it('should call updateLogEvent if data persisted correctly', async () => {
    return createDeductionRequest(conversationId, nhsNumber, odsCode).then(() => {
      expect(updateLogEvent).toHaveBeenCalledTimes(1);
      return expect(updateLogEvent).toHaveBeenCalledWith({
        status: 'Deduction request has been stored'
      });
    });
  });

  it('should create deduction request with correct values', () => {
    return createDeductionRequest(conversationId, nhsNumber, odsCode).then(request => {
      expect(request).not.toBeNull();
      expect(request.get().conversation_id).toBe(conversationId);
      return expect(request.get().nhs_number).toBe(nhsNumber);
    });
  });

  it('should log errors when nhs number is invalid', async () => {
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
