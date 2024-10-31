const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('monetix', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;