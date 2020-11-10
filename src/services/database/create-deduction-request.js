import { runWithinTransaction } from './helper';
import { updateLogEvent } from '../../middleware/logging';
import ModelFactory from '../../models';
import { modelName } from '../../models/deduction-request';

const DeductionRequest = ModelFactory.getByName(modelName);

export const createDeductionRequest = (conversationId, nhsNumber, odsCode) =>
  runWithinTransaction(transaction =>
    DeductionRequest.create(
      {
        conversationId,
        nhsNumber,
        odsCode
      },
      transaction
    )
      .then(requests => requests[0])
      .then(() => updateLogEvent({ status: 'Deduction request has been stored' }))
  );
