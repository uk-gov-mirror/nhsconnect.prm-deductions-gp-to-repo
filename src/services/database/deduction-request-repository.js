import ModelFactory from '../../models';
import { runWithinTransaction } from './helper';

const DeductionRequest = ModelFactory.getByName('DeductionRequest');

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
