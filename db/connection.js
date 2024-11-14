const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

//homolog
/*
const sequelize = new Sequelize('monetix', 'root', null, {
  host: 'localhost',
  dialect: 'mysql',
});*/

//prod
/*
const sequelize = new Sequelize('defaultdb', 'doadmin', 'AVNS_EZN9VXNMVHMh08FZ-CS', {
  host: 'monetixdb-do-user-18316313-0.i.db.ondigitalocean.com',
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
*/

//sandbox
const sequelize = new Sequelize('defaultdb', 'doadmin', 'AVNS_JtZt-Sw4_6-6GO5U4Ln', {
  host: 'monetix-sandbox-do-user-18316313-0.k.db.ondigitalocean.com',
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

module.exports = sequelize;