import ModelFactory from '../../models';
import { updateLogEvent, updateLogEventWithError } from '../../middleware/logging';

const sequelize = ModelFactory.sequelize;

export const runWithinTransaction = async dbInteractionLambda => {
  const transaction = await sequelize.transaction();
  try {
    const response = await dbInteractionLambda(transaction);
    transaction.commit();
    updateLogEvent({ status: 'Deduction request has been stored' });
    return response;
  } catch (err) {
    updateLogEventWithError(err);
    await transaction.rollback();
    throw err;
  }
};
