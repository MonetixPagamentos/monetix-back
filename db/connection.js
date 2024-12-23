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
  sequelize = new Sequelize('defaultdb', 'doadmin', 'AVNS_X5grNxqGgswGOQFZqqQ', {
    host: 'db-mysql-nyc1-39828-do-user-18325952-0.f.db.ondigitalocean.com',
    dialect: 'mysql',
    port: 25060,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(__dirname, 'ca-certificate-sandbox.crt'))
      }
    },
      timezone: '-03:00'
  });
} else if (process.env.HOMOLOG == 2) { // sandobox
  sequelize = new Sequelize('monetix', 'doadmin', 'AVNS_X5grNxqGgswGOQFZqqQ', {
    host: 'db-mysql-nyc1-39828-do-user-18325952-0.f.db.ondigitalocean.com',
    dialect: 'mysql',
    port: 25060,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(__dirname, 'ca-certificate-sandbox.crt'))
      }
    },
      timezone: '-03:00'
  });
}


module.exports = sequelize;