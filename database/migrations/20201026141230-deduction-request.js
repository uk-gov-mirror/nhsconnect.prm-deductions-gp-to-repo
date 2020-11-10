'use strict';

const tableName = 'deduction_requests';

const model = dataType => {
  return {
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
      unique: false,
      allowNull: false
    },
    status: {
      field: 'status',
      type: dataType.STRING,
      allowNull: false,
      isIn: [
        [
          'started',
          'pds_updated',
          'success_pds_update',
          'ehr_request_sent',
          'ehr_extract_received',
          'failed'
        ]
      ]
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
  };
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, model(Sequelize));
  },
  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  }
};
