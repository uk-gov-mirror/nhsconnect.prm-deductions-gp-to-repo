'use strict';

const tableName = 'deduction_requests';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn(tableName, 'status');
        return queryInterface.addColumn(tableName, 'status', {
            type: Sequelize.STRING,
            allowNull: false,
            isIn: [
                [
                    'started',
                    'pds_update_sent',
                    'pds_updated',
                    'ehr_request_sent',
                    'ehr_extract_received',
                    'failed'
                ]
            ],
            defaultValue: 'started'
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn(tableName, 'status');
        return queryInterface.addColumn(tableName, 'status', {
            type: Sequelize.STRING,
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
        });
    }
};
