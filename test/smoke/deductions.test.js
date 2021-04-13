import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import { v4 as uuid } from 'uuid';

const assignPatientToTPPOdsCode = async (nhsNumber, tppOdsCode) => {
  // - get the PDS info
  const pdsResponse = await axios
    .get(`${process.env.GP2GP_URL}/patient-demographics/${nhsNumber}/`, {
      headers: {
        Authorization: process.env.GP2GP_AUTHORIZATION_KEYS
      },
      adapter
    })
    .catch(err => {
      console.log(err);
    });

  // - update PDS
  const patchResponse = await axios
    .patch(
      `${process.env.GP2GP_URL}/patient-demographics/${nhsNumber}`,
      {
        pdsId: pdsResponse.data.data.patientPdsId,
        serialChangeNumber: pdsResponse.data.data.serialChangeNumber,
        newOdsCode: tppOdsCode,
        conversationId: uuid()
      },
      {
        headers: {
          Authorization: process.env.GP2GP_AUTHORIZATION_KEYS
        },
        adapter
      }
    )
    .catch(err => {
      console.log(err);
    });

  //we have to wait as PDS needs time to process the update
  //to investigate: when there is no sleep, the get fails with 503, we need find out why
  await sleep(500);

  expect(patchResponse.status).toBe(204);
  const pdsResponseCheck = await axios
    .get(`${process.env.GP2GP_URL}/patient-demographics/${nhsNumber}/`, {
      headers: {
        Authorization: process.env.GP2GP_AUTHORIZATION_KEYS
      },
      adapter
    })
    .catch(err => {
      console.log(err);
    });
  expect(pdsResponseCheck.data.data.odsCode).toBe(tppOdsCode);
};

const assignPatientToEMISOdsCode = async (nhsNumber, emisOdsCode) => {
  // - get the PDS info
  const pdsResponse = await axios
    .get(`${process.env.GP2GP_URL}/patient-demographics/${nhsNumber}/`, {
      headers: {
        Authorization: process.env.GP2GP_AUTHORIZATION_KEYS
      },
      adapter
    })
    .catch(err => {
      console.log(err);
    });

  // - update PDS
  const patchResponse = await axios
    .patch(
      `${process.env.GP2GP_URL}/patient-demographics/${nhsNumber}`,
      {
        pdsId: pdsResponse.data.data.patientPdsId,
        serialChangeNumber: pdsResponse.data.data.serialChangeNumber,
        newOdsCode: emisOdsCode,
        conversationId: uuid()
      },
      {
        headers: {
          Authorization: process.env.GP2GP_AUTHORIZATION_KEYS
        },
        adapter
      }
    )
    .catch(err => {
      console.log(err);
    });

  //we have to wait as PDS needs time to process the update
  //to investigate: when there is no sleep, the get fails with 503, we need find out why
  await sleep(500);

  expect(patchResponse.status).toBe(204);
  const pdsResponseCheck = await axios
    .get(`${process.env.GP2GP_URL}/patient-demographics/${nhsNumber}/`, {
      headers: {
        Authorization: process.env.GP2GP_AUTHORIZATION_KEYS
      },
      adapter
    })
    .catch(err => {
      console.log(err);
    });
  expect(pdsResponseCheck.data.data.odsCode).toBe(emisOdsCode);
};

describe('Smoke test for deduction process', () => {
  it('should handle a deduction for a patient of TPP practice with the small Health Record', async () => {
    const nhsNumber = '9442964410';
    const tppOdsCode = 'M85019';

    console.log('GP2GP Adaptor URL:', process.env.GP2GP_URL);
    //setup: make sure the patient nhs number is assigned to TPP in PDS
    await assignPatientToTPPOdsCode(nhsNumber, tppOdsCode);
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
        console.log(err);
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
    const responseBody = deductionRequestResource.data;
    expect(responseBody.data.attributes.status).toBe('ehr_extract_received');
  }, 30000);

  it('should handle a deduction for a patient of EMIS practice with the large Health Record', async () => {
    const nhsNumber = '9692295427';
    const emisOdsCode = 'N82668';

    console.log('GP2GP Adaptor URL:', process.env.GP2GP_URL);
    //setup: make sure the patient nhs number is assigned to EMIS in PDS
    await assignPatientToEMISOdsCode(nhsNumber, emisOdsCode);
    //action: call /deduction-request with the EMIS patient number

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
    const splitDeductionRequestResourceUrl = response.headers['location'].split('/');
    const conversationId =
      splitDeductionRequestResourceUrl[splitDeductionRequestResourceUrl.length - 1];
    console.log('DeductionRequest conversationId:', conversationId);

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
    const responseBody = deductionRequestResource.data;
    expect(responseBody.data.attributes.status).toBe('continue_message_sent');

    //assertion: 2) ehr-repo has the large EHR for the specific transfer
    const ehrRepoUrl = process.env.EHR_REPO_URL;
    console.log('EHR Repo URL:', process.env.EHR_REPO_URL);

    await sleep(10000);
    const healthRecordResourceStatus = await axios
      .get(`${ehrRepoUrl}/patients/${nhsNumber}/health-records/${conversationId}`, {
        headers: {
          Authorization: process.env.EHR_REPO_AUTHORIZATION_KEYS
        },
        adapter
      })
      .catch(err => {
        console.log(err.response);
      });

    expect(healthRecordResourceStatus.status).toBe(200);

    const healthRecordResource = await axios
      .get(`${ehrRepoUrl}/patients/${nhsNumber}`, {
        headers: {
          Authorization: process.env.EHR_REPO_AUTHORIZATION_KEYS
        },
        adapter
      })
      .catch(err => {
        console.log(err.response);
      });

    expect(healthRecordResource.status).toBe(200);
    expect(healthRecordResource.data.data.links['attachments']).toHaveLength(2);
    expect(healthRecordResource.data.data.links['attachments'][0]).toContain(conversationId);
  }, 30000);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// call the other endpoint
