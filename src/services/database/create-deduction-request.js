import ModelFactory from '../../models';
import { runWithinTransaction } from './helper';

const DeductionRequests = ModelFactory.getByName('DeductionRequests');

export const createDeductionRequest = (conversationId, nhsNumber, odsCode) =>
  runWithinTransaction(transaction =>
    DeductionRequests.findOrCreateRequest(conversationId, nhsNumber, odsCode, transaction)
  );
