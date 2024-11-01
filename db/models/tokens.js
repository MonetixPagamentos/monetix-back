const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection'); 

const Token = sequelize.define('token', {
  token: {
    type: DataTypes.STRING, allowNull: false, 
  },
  id_gateway: {
    type: DataTypes.INTEGER, allowNull: false, 
  },
  ativo: {
    type: DataTypes.INTEGER, defaultValue: 0
  }
}, {
  timestamps: true, 
  underscored: true 
});

// Sincroniza o modelo com o banco de dados
Token.sync();

module.exports = Token;