import getParameters from './parameters';

export const healthCheckModelName = 'HealthCheck';
const tableName = 'health_checks';

const model = dataType => ({
  id: {
    type: dataType.UUID,
    primaryKey: true,
    defaultValue: dataType.UUIDV4
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
  return sequelize.define(healthCheckModelName, model(DataTypes), {
    ...getParameters(tableName)
  });
};
