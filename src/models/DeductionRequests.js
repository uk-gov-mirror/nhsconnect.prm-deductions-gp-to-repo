import getParameters from './parameters';

const modelName = 'DeductionRequests';
const tableName = 'deduction_requests';

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
    unique: true,
    allowNull: false
  },
  status: {
    type: dataType.STRING,
    allowNull: false,
    isIn: [
      [
        'started',
        'pds_update_sent',
        'success_pds_update',
        'ehr_request_sent',
        'ehr_extract_received',
        'failed'
      ]
    ],
    defaultValue: 'started'
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

module.exports = (sequelize, DataTypes) => {
  const DeductionRequests = sequelize.define(modelName, model(DataTypes), getParameters(tableName));

  DeductionRequests.findOrCreateRequest = (conversationId, nhsNumber, odsCode, transaction) =>
    DeductionRequests.findOrCreate({
      where: {
        conversation_id: conversationId,
        nhs_number: nhsNumber,
        ods_code: odsCode
      },
      transaction: transaction
    }).then(requests => requests[0]);

  return DeductionRequests;
};
