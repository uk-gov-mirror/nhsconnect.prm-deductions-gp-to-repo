import { runWithinTransaction } from './helper';
import ModelFactory from '../../models';
import { modelName } from '../../models/deduction-request';

const DeductionRequest = ModelFactory.getByName(modelName);

export const getDeductionRequestByConversationId = conversationId => {
  return DeductionRequest.findByPk(conversationId);
};

export const updateDeductionRequestStatus = async (conversationId, status) => {
  await runWithinTransaction(async transaction => {
    return await DeductionRequest.update(
      { status },
      {
        where: { conversation_id: conversationId },
        transaction
      }
    );
  });
};
