import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import { v4 as uuid } from 'uuid';

describe('Smoke test for deduction process', () => {
  const RETRY_COUNT = 30;
  const POLLING_INTERVAL_MS = 500;
  const TEST_TIMEOUT = 3 * RETRY_COUNT * POLLING_INTERVAL_MS;

  it(
    'should handle a deduction for a patient of TPP practice with the small Health Record',
    async () => {
      const nhsNumber = '9442964410';
      const tppOdsCode = 'M85019';

      // Setup: make sure the patient nhs number is assigned to EMIS in PDS
      await assignPatientToOdsCode(nhsNumber, tppOdsCode);

      // PDS update polling
      let patientOdsCode;
      for (let i = 0; i < RETRY_COUNT; i++) {
        patientOdsCode = await getPatientOdsCode(nhsNumber);
        console.log(`try: ${i} - status: ${patientOdsCode}`);

        if (patientOdsCode === tppOdsCode) {
          break;
        }
        await sleep(POLLING_INTERVAL_MS);
      }

      expect(patientOdsCode).toEqual(tppOdsCode);

      // Action: call /deduction-request with the TPP patient number
      const deductionRequestResponse = await axios
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

      const deductionRequestResourceUrl = deductionRequestResponse.headers['location'];

      // Assertion
      // 1) status of the deduction is "ehr-extract-received"
      // 2) ehr-repo has the EHR (??)

      // Deduction request status update polling
      const expectedStatus = 'ehr_extract_received';
      let deductionRequestStatus;
      for (let i = 0; i < RETRY_COUNT; i++) {
        deductionRequestStatus = await getDeductionRequestStatus(
          nhsNumber,
          deductionRequestResourceUrl
        );
        console.log(`try: ${i} - status: ${deductionRequestStatus}`);

        if (deductionRequestStatus === expectedStatus) {
          break;
        }
        await sleep(POLLING_INTERVAL_MS);
      }
      expect(deductionRequestStatus).toBe(expectedStatus);
    },
    TEST_TIMEOUT
  );

  it(
    'should handle a deduction for a patient of EMIS practice with the large Health Record',
    async () => {
      const nhsNumber = '9692295427';
      const emisOdsCode = 'N82668';

      // Setup: make sure the patient nhs number is assigned to EMIS in PDS
      await assignPatientToOdsCode(nhsNumber, emisOdsCode);

      // PDS update polling
      let patientOdsCode;
      for (let i = 0; i < RETRY_COUNT; i++) {
        patientOdsCode = await getPatientOdsCode(nhsNumber);
        console.log(`try: ${i} - status: ${patientOdsCode}`);

        if (patientOdsCode === emisOdsCode) {
          break;
        }
        await sleep(POLLING_INTERVAL_MS);
      }

      expect(patientOdsCode).toEqual(emisOdsCode);

      // Action: call /deduction-request with the EMIS patient number
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

      // Deduction request status update polling
      const expectedStatus = 'continue_message_sent';
      let deductionRequestStatus;
      for (let i = 0; i < RETRY_COUNT; i++) {
        deductionRequestStatus = await getDeductionRequestStatus(
          nhsNumber,
          deductionRequestResourceUrl
        );
        console.log(`try: ${i} - status: ${deductionRequestStatus}`);

        if (deductionRequestStatus === expectedStatus) {
          break;
        }
        await sleep(POLLING_INTERVAL_MS);
      }
      expect(deductionRequestStatus).toBe(expectedStatus);

      // Assertion: ehr-repo has the large EHR for the specific transfer

      // Health record status polling
      let patientHealthRecordStatus;
      for (let i = 0; i < RETRY_COUNT; i++) {
        patientHealthRecordStatus = await getHealthRecordStatus(nhsNumber, conversationId);
        console.log(`try: ${i} - status: ${patientHealthRecordStatus}`);

        if (patientHealthRecordStatus === 200) {
          break;
        }
        await sleep(POLLING_INTERVAL_MS);
      }
      expect(patientHealthRecordStatus).toBe(200);

      const patientHealthRecord = await axios
        .get(`${process.env.EHR_REPO_URL}/patients/${nhsNumber}`, {
          headers: {
            Authorization: process.env.EHR_REPO_AUTHORIZATION_KEYS
          },
          adapter
        })
        .catch(err => {
          console.log(err.response);
        });

      expect(patientHealthRecord.status).toBe(200);
      expect(patientHealthRecord.data.data.links['attachments']).toHaveLength(2);
      expect(patientHealthRecord.data.data.links['attachments'][0]).toContain(conversationId);
    },
    TEST_TIMEOUT
  );
});

const assignPatientToOdsCode = async (nhsNumber, odsCode) => {
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
        newOdsCode: odsCode,
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

  expect(patchResponse.status).toBe(204);
};

const getPatientOdsCode = async nhsNumber => {
  try {
    const patientDemographics = await axios.get(
      `${process.env.GP2GP_URL}/patient-demographics/${nhsNumber}`,
      {
        headers: { Authorization: process.env.GP2GP_AUTHORIZATION_KEYS },
        adapter
      }
    );
    return patientDemographics.data.data.odsCode;
  } catch (err) {
    console.log(err.response.status);
    return undefined;
  }
};

const getHealthRecordStatus = async (nhsNumber, conversationId) => {
  try {
    const patientHealthRecordResponse = await axios.get(
      `${process.env.EHR_REPO_URL}/patients/${nhsNumber}/health-records/${conversationId}`,
      {
        headers: {
          Authorization: process.env.EHR_REPO_AUTHORIZATION_KEYS
        },
        adapter
      }
    );
    return patientHealthRecordResponse.status;
  } catch (err) {
    console.log(err.response.status);
    return undefined;
  }
};

const getDeductionRequestStatus = async (nhsNumber, deductionRequestResourceUrl) => {
  try {
    const deductionRequestResponse = await axios.get(deductionRequestResourceUrl, {
      headers: {
        Authorization: process.env.AUTHORIZATION_KEYS
      },
      adapter
    });

    return deductionRequestResponse.data.data.attributes.status;
  } catch (err) {
    console.log(err.response.status);
    return undefined;
  }
};

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
