'use strict';

const tableName = 'deduction_requests';

const model = dataType => {
  return {
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
          'pds_updated',
          'success_pds_update',
          'ehr_request_sent',
          'ehr_extract_received',
          'failed'
        ]
      ]
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
