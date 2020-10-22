import { sendUpdateRequest } from '../../services/gp2gp';
import { updateLogEvent } from '../../middleware/logging';

export const handleUpdateRequest = async (pdsRetrievalResponse, nhsNumber) => {
  if (pdsRetrievalResponse.status === 200) {
    updateLogEvent({
      status: '200 GP2GP response received',
      response: pdsRetrievalResponse
    });

    const updateResponse = await sendUpdateRequest(
      pdsRetrievalResponse.data.data.serialChangeNumber,
      pdsRetrievalResponse.data.data.patientPdsId,
      nhsNumber
    );

    if (updateResponse.status === 204) return updateResponse;
    else throw new Error(`Failed to Update: ${updateResponse.data}`);
  } else {
    throw new Error(`Unexpected Error: ${pdsRetrievalResponse.data}`);
  }
};
