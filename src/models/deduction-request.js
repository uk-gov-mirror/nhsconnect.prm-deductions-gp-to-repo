import getParameters from './parameters';

export const modelName = 'DeductionRequest';
const tableName = 'deduction_requests';

export const Status = {
  STARTED: 'started',
  PDS_UPDATE_SENT: 'pds_update_sent',
  PDS_UPDATED: 'pds_updated',
  EHR_REQUEST_SENT: 'ehr_request_sent',
  EHR_REQUEST_RECEIVED: 'ehr_extract_received',
  LARGE_EHR_STARTED: 'large_ehr_started',
  FAILED: 'failed'
};

Object.freeze(Status);

const model = dataType => ({
  conversationId: {
    field: 'conversation_id',
    type: dataType.UUID,
    primaryKey: true,
    defaultValue: dataType.UUIDV4
  },
  nhsNumber: {
    field: 'nhs_number',
    type: dataType.CHAR(10),
    validate: {
      isNumeric: true,
      len: 10
    },
    allowNull: false
  },
  status: {
    field: 'status',
    type: dataType.STRING,
    allowNull: false,
    isIn: [Object.values(Status)]
  },
  odsCode: {
    field: 'ods_code',
    type: dataType.STRING,
    allowNull: false
  },
  createdAt: {
    field: 'created_at',
    type: dataType.DATE,
    allowNull: false
  },
  updatedAt: {
    field: 'updated_at',
    type: dataType.DATE,
    allowNull: false
  },
  deletedAt: {
    field: 'deleted_at',
    type: dataType.DATE
  }
});

export default (sequelize, DataTypes) => {
  return sequelize.define(modelName, model(DataTypes), getParameters(tableName));
};
