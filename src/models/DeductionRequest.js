import getParameters from './parameters';

export const modelName = 'DeductionRequest';
const tableName = 'deduction_requests';

export const Status = {
  STARTED: 'started',
  PDS_UPDATE_SENT: 'pds_update_sent',
  PDS_UPDATED: 'pds_updated',
  EHR_REQUEST_SENT: 'ehr_request_sent',
  EHR_REQUEST_RECEIVED: 'ehr_extract_received',
  FAILED: 'failed'
};

Object.freeze(Status);

const model = dataType => ({
  conversation_id: {
    type: dataType.UUID,
    primaryKey: true,
    defaultValue: dataType.UUIDV4
  },
  nhs_number: {
    type: dataType.CHAR(10),
    validate: {
      isNumeric: true,
      len: 10
    },
    allowNull: false
  },
  status: {
    type: dataType.STRING,
    allowNull: false,
    isIn: [Object.values(Status)],
    defaultValue: Status.STARTED
  },
  ods_code: {
    type: dataType.STRING,
    allowNull: false
  },
  created_at: {
    type: dataType.DATE,
    allowNull: false
  },
  updated_at: {
    type: dataType.DATE,
    allowNull: false
  },
  deleted_at: dataType.DATE
});

export default (sequelize, DataTypes) => {
  return sequelize.define(modelName, model(DataTypes), getParameters(tableName));
};
