const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Handler = sequelize.define('handler', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, },
    version: {type: DataTypes.INTEGER},
    executed: {type: DataTypes.INTEGER, defaultValue: 0},
},{
  timestamps: true, 
  underscored: true,
});

Handler.sync();
module.exports = Handler;
