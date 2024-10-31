const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('monetix', 'root', null, {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;