const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Documents = sequelize.define('documents', {

    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_gateway: { type: DataTypes.STRING, allowNull: false }, // ID do gateway
    id_user: { type: DataTypes.INTEGER, allowNull: false }, // ID do usuário
    contrato_social: { type: DataTypes.STRING, allowNull: false }, // Contrato social
    documento_frente: { type: DataTypes.STRING, allowNull: false }, // Documento frente
    documento_verso: { type: DataTypes.STRING, allowNull: false }, // Documento verso
    selfie: { type: DataTypes.STRING, allowNull: false }, // Selfie do usuário
    contrato_social_status: { type: DataTypes.STRING, defaultValue: 'Aguardando Análise'  }, // Status do contrato social
    documento_frente_status: { type: DataTypes.STRING, defaultValue: 'Aguardando Análise'  }, // Status do documento frente
    documento_verso_status: { type: DataTypes.STRING, defaultValue: 'Aguardando Análise'  }, // Status do documento verso
    selfie_status: { type: DataTypes.STRING, defaultValue: 'Aguardando Análise'  }, // Status da selfie
    status: { type: DataTypes.STRING, defaultValue: "0" }, // Status geral
    motivo_status: { type: DataTypes.STRING, defaultValue: 'Aguardando Análise' }, // Descrição do status
}, {
  timestamps: true, 
  underscored: true,
});
  
  // Sincroniza o modelo com o banco de dados
  Documents.sync();
  
  module.exports = Documents;

