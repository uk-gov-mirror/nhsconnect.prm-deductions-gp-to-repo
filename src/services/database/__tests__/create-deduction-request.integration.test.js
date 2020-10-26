import ModelFactory from '../../../models';
import { createAndLinkEntries } from '../create-deduction-request';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';

jest.mock('../../../middleware/logging');

describe('createDeductionRequest', () => {
  const nhsNumber = '1234567890';
  const conversationId = '099cd501-034f-4e17-a461-cf4fd93ae0cf';
  const odsCode = 'B1234';
  const sequelize = ModelFactory.sequelize;
  const DeductionRequests = ModelFactory.getByName('DeductionRequests');

  afterAll(() => {
    ModelFactory.sequelize.close();
  });

  it('should call updateLogEvent if data persisted correctly', () => {
    return sequelize.transaction().then(transaction =>
      createAndLinkEntries(conversationId, nhsNumber, odsCode, transaction)
        .then(() => {
          expect(updateLogEvent).toHaveBeenCalledTimes(1);
          return expect(updateLogEvent).toHaveBeenCalledWith({
            status: 'Deduction request has been stored'
          });
        })
        .finally(() => transaction.rollback())
    );
  });

  it('should create deduction request with correct values', () => {
    return sequelize.transaction().then(transaction =>
      createAndLinkEntries(conversationId, nhsNumber, odsCode, transaction)
        .then(() =>
          DeductionRequests.findOne({
            where: {
              conversation_id: conversationId
            },
            transaction: transaction
          })
        )
        .then(request => {
          expect(request).not.toBeNull();
          expect(request.get().conversation_id).toBe(conversationId);
          return expect(request.get().nhs_number).toBe(nhsNumber);
        })
        .finally(() => transaction.rollback())
    );
  });

  it('should log errors when nhs number is invalid', () => {
    return sequelize.transaction().then(transaction =>
      createAndLinkEntries(conversationId, '123', odsCode, transaction)
        .catch(error => {
          expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
          expect(updateLogEventWithError).toHaveBeenCalledWith(error);
          return expect(error.message).toContain('Validation len on nhs_number failed');
        })
        .finally(() => transaction.rollback())
    );
  });

  it('should log errors when conversationId is invalid', () => {
    return sequelize.transaction().then(transaction =>
      createAndLinkEntries('invalid-conversation-id', nhsNumber, odsCode, transaction)
        .catch(error => {
          expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
          expect(updateLogEventWithError).toHaveBeenCalledWith(error);
          return expect(error.message).toContain(
            'invalid input syntax for type uuid: "invalid-conversation-id"'
          );
        })
        .finally(() => transaction.rollback())
    );
  });
});
