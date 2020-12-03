import { runWithinTransaction } from './helper';
import { logEvent } from '../../middleware/logging';
import ModelFactory from '../../models';
import { modelName, Status } from '../../models/deduction-request';

const DeductionRequest = ModelFactory.getByName(modelName);

export const createDeductionRequest = (conversationId, nhsNumber, odsCode) =>
  runWithinTransaction(transaction =>
    DeductionRequest.create(
      {
        conversationId,
        nhsNumber,
        odsCode,
        status: Status.STARTED
      },
      transaction
    )
      .then(requests => requests[0])
      .then(() => logEvent('Deduction request has been stored'))
  );
