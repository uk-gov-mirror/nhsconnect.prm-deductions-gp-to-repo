import ModelFactory from '../../models';

const DeductionRequest = ModelFactory.getByName("DeductionRequest");

export const getDeductionRequestByConversationId = conversationId => {
  return DeductionRequest.findByPk(conversationId).then(deductionRequest => ({
    nhsNumber: deductionRequest.nhs_number
  }));
};
