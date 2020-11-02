import { runWithinTransaction } from './helper';
import { updateLogEvent } from '../../middleware/logging';
import ModelFactory from '../../models';
import { modelName } from '../../models/DeductionRequest';

const DeductionRequest = ModelFactory.getByName(modelName);

export const createDeductionRequest = (conversationId, nhsNumber, odsCode) =>
  runWithinTransaction(transaction =>
    DeductionRequest.create(
      {
        conversation_id: conversationId,
        nhs_number: nhsNumber,
        ods_code: odsCode
      },
      transaction
    )
      .then(requests => requests[0])
      .then(() => updateLogEvent({ status: 'Deduction request has been stored' }))
  );
