const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

var sequelize;
if (process.env.HOMOLOG == 0) { //homolog
  sequelize = new Sequelize('monetix', 'root', null, {
    host: 'localhost',
    dialect: 'mysql',
  });
} else if (process.env.HOMOLOG == 1) { // sandobox
  sequelize = new Sequelize('defaultdb', 'doadmin', 'AVNS_EZN9VXNMVHMh08FZ-CS', {
    host: 'monetixdb-do-user-18316313-0.i.db.ondigitalocean.com',
    dialect: 'mysql',
    port: 25060,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(__dirname, 'ca-certificate-sandbox.crt'))
      }
    }
  });
} else if (process.env.HOMOLOG == 2) { // prod
  sequelize = new Sequelize('defaultdb', 'doadmin', 'AVNS_km51tKNzBd4nJ0KMoEG', {
    host: 'modetix-prod-do-user-18325952-0.i.db.ondigitalocean.com',
    dialect: 'mysql',
    port: 25060,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(__dirname, 'ca-monetix-db.crt'))
      }
    }
  });
}


module.exports = sequelize;