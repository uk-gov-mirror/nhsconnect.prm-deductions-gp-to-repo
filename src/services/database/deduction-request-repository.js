import ModelFactory from '../../models';

const DeductionRequests = ModelFactory.getByName('DeductionRequests');

export const getDeductionRequestByConversationId = conversationId => {
  return DeductionRequests.findByPk(conversationId).then(deductionRequest => ({
    nhsNumber: deductionRequest.nhs_number
  }));
};
