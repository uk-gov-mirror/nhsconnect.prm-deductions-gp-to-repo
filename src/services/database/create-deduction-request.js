import ModelFactory from '../../models';
import { updateLogEvent, updateLogEventWithError } from '../../middleware/logging';

const sequelize = ModelFactory.sequelize;
const DeductionRequests = ModelFactory.getByName('DeductionRequests');

export const createAndLinkEntries = (conversationId, nhsNumber, odsCode, transaction) =>
  DeductionRequests.findOrCreateRequest(conversationId, nhsNumber, odsCode, transaction)
    .then(() => updateLogEvent({ status: 'Deduction request has been stored' }))
    .catch(error => {
      updateLogEventWithError(error);
      throw error;
    });

export const createDeductionRequest = (conversationId, nhsNumber, odsCode) =>
  sequelize.transaction().then(transaction =>
    createAndLinkEntries(conversationId, nhsNumber, odsCode, transaction)
      .then(() => transaction.commit())
      .catch(error => {
        transaction.rollback();
        throw error;
      })
  );
