'use strict';

const tableName = 'deduction_requests';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(tableName, 'nhs_number');
    return queryInterface.addColumn(tableName, 'nhs_number', {
      type: Sequelize.CHAR(10),
      validate: {
        isNumeric: true,
        len: 10
      },
      unique: false,
      allowNull: false
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(tableName, 'nhs_number');
    return await queryInterface.addColumn(tableName, 'nhs_number', {
      type: Sequelize.CHAR(10),
      validate: {
        isNumeric: true,
        len: 10
      },
      unique: true,
      allowNull: true
    });
  }
};
