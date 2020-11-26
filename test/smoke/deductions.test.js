import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import { v4 as uuid } from 'uuid';

const assignPatientToOdsCode = async (nhsNumber, tppOdsCode) => {
  // - get the PDS info
  const pdsResponse = await axios
    .get(`${process.env.GP2GP_ADAPTOR_URL}/patient-demographics/${nhsNumber}/`, {
      headers: {
        Authorization: process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS
      },
      adapter
    })
    .catch(err => {
      console.log(err.response);
    });

  // - update PDS
  const patchResponse = await axios
    .patch(
      `${process.env.GP2GP_ADAPTOR_URL}/patient-demographics/${nhsNumber}`,
      {
        pdsId: pdsResponse.data.data.patientPdsId,
        serialChangeNumber: pdsResponse.data.data.serialChangeNumber,
        newOdsCode: tppOdsCode,
        conversationId: uuid()
      },
      {
        headers: {
          Authorization: process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS
        },
        adapter
      }
    )
    .catch(err => {
      console.log(err.response);
    });

  //we have to wait as PDS needs time to process the update
  //to investigate: when there is no sleep, the get fails with 503, we need find out why
  await sleep(500);

  expect(patchResponse.status).toBe(204);
  const pdsResponseCheck = await axios
    .get(`${process.env.GP2GP_ADAPTOR_URL}/patient-demographics/${nhsNumber}/`, {
      headers: {
        Authorization: process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS
      },
      adapter
    })
    .catch(err => {
      console.log(err.response);
    });
  expect(pdsResponseCheck.data.data.odsCode).toBe(tppOdsCode);
};
describe('Smoke test for deduction process', () => {
  it('should handle a deduction for a patient of TPP', async () => {
    const nhsNumber = '9442964410';
    const tppOdsCode = 'M85019';

    //setup: make sure the patient nhs number is assigned to TPP in PDS
    await assignPatientToOdsCode(nhsNumber, tppOdsCode);
    //action: call /deduction-request with the TPP patient number

    const response = await axios
      .post(
        `${process.env.SERVICE_URL}/deduction-requests/`,
        { nhsNumber },
        {
          headers: {
            Authorization: process.env.AUTHORIZATION_KEYS
          },
          adapter
        }
      )
      .catch(err => {
        console.log(err.response);
      });
    const deductionRequestResourceUrl = response.headers['location'];

    //assertion: 1) status of the deduction is "ehr-extract-received"; 2) ehr-repo has the EHR (??)

    await sleep(10000);
    const deductionRequestResource = await axios
      .get(deductionRequestResourceUrl, {
        headers: {
          Authorization: process.env.AUTHORIZATION_KEYS
        },
        adapter
      })
      .catch(err => {
        console.log(err.response);
      });

    expect(deductionRequestResource.status).toBe(200);
    let responseBody = deductionRequestResource.data;
    expect(responseBody.data.attributes.status).toBe('ehr_extract_received');
  }, 30000);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
