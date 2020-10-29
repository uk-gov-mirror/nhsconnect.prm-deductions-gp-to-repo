import ModelFactory from '../../models';
import { deductionRequestModelName } from "../../models/DeductionRequest";

const DeductionRequest = ModelFactory.getByName(deductionRequestModelName);

export const getDeductionRequestByConversationId = conversationId => {
  return DeductionRequest.findByPk(conversationId).then(deductionRequest => ({
    nhsNumber: deductionRequest.nhs_number
  }));
};
