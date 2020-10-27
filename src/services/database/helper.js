import ModelFactory from '../../models';
import { updateLogEventWithError } from '../../middleware/logging';

const sequelize = ModelFactory.sequelize;

export const runWithinTransaction = async dbInteractionLambda => {
  const transaction = await sequelize.transaction();
  try {
    const response = await dbInteractionLambda(transaction);
    await transaction.commit();
    return response;
  } catch (err) {
    updateLogEventWithError(err);
    await transaction.rollback();
    throw err;
  }
};
