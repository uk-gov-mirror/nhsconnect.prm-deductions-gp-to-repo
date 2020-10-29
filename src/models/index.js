import config from '../config';
import Sequelize from 'sequelize';

import DeductionRequest from "./DeductionRequest";
import HealthCheck from "./HealthCheck";


class ModelFactory {
  constructor() {
    this.db = {};
    this.sequelize = {};
    this.config = config.sequelize;
    this._resetConfig();
  }

  _overrideConfig(key, value) {
    this.base_config[key] = value;
    this.configure();
  }

  _resetConfig() {
    this.base_config = this.config;
    this.configure();
  }

  configure() {
    if (this.sequelize instanceof Sequelize) {
      this.sequelize.close();
    }

    this.sequelize = new Sequelize(
      this.base_config.database,
      this.base_config.username,
      this.base_config.password,
      this.base_config
    );

    this.reload_models();
  }

  reload_models() {
    this.db = {};
    [DeductionRequest, HealthCheck].forEach(module => {
      const model = module(this.sequelize, Sequelize.DataTypes)
      this.db[model.name] = model;
    });

    Object.keys(this.db).forEach(modelName => {
      if (this.db[modelName].associate) {
        this.db[modelName].associate(this.db);
      }
    });

    this.db.sequelize = this.sequelize;
    this.db.Sequelize = Sequelize;
  }

  getByName(moduleName) {
    return this.db[moduleName];
  }
}

export default new ModelFactory();
