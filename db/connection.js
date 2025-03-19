const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

var sequelize;
if (process.env.HOMOLOG == 0) { //homolog
  sequelize = new Sequelize('monetix', 'root', null, {
    host: 'localhost',
    dialect: 'mysql',    
    timezone: '-03:00'
  });
} else if (process.env.HOMOLOG == 1) { // sandobox
  sequelize = new Sequelize('defaultdb', 'doadmin', 'AVNS_cm2jJR7gRGZnaPdg_nN', {
    host: 'db-mysql-nyc1-39828-do-user-18325952-0.f.db.ondigitalocean.com',
    dialect: 'mysql',
    port: 25060,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(__dirname, 'ca-cortex.crt'))
      }
    },
      timezone: '-03:00'
  });
} else if (process.env.HOMOLOG == 2) { // prod
  sequelize = new Sequelize('monetix', 'doadmin', 'AVNS_cm2jJR7gRGZnaPdg_nN', {
    host: 'db-mysql-nyc3-07394-do-user-18325952-0.e.db.ondigitalocean.com',
    dialect: 'mysql',
    port: 25060,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(__dirname, 'ca-cortex.crt'))
      }
    },
      timezone: '-03:00'
  });
}


module.exports = sequelize;