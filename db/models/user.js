const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Define o índice único
  },
  document: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Define o índice único
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Define o índice único
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  }, 
   verificacao_email: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  }
}, {
  timestamps: true, // Isso gerencia createdAt e updatedAt automaticamente
  underscored: true,
});

// Sincroniza o modelo com o banco de dados
User.sync();

module.exports = User;
