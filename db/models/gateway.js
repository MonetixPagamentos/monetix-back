const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Gateway = sequelize.define('gateway', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  gateway_name: { type: DataTypes.STRING, allowNull: false },
  document_gateway: { type: DataTypes.STRING, allowNull: false },
  business_opening_date: { type: DataTypes.DATE, allowNull: false },
  statement_descriptor: { type: DataTypes.STRING, allowNull: true },
  middle_ticket: { type: DataTypes.INTEGER, allowNull: true },
  zip_code: { type: DataTypes.STRING, allowNull: true },
  street: { type: DataTypes.STRING, allowNull: true },
  number: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  district: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  owner: { type: DataTypes.STRING, allowNull: true },
  name_responsable: { type: DataTypes.STRING, allowNull: true },
  document_responsable: { type: DataTypes.STRING, allowNull: true },
  phone_responsable: { type: DataTypes.STRING, allowNull: true },
  email_responsable: { type: DataTypes.STRING, allowNull: true },
  birth_date: { type: DataTypes.DATE, allowNull: true},
  mother_name: {type: DataTypes.STRING, allowNull: true},
  bank: {type: DataTypes.STRING, allowNull: true},
  agency: {type: DataTypes.STRING, allowNull: true},
  account: {type: DataTypes.STRING, allowNull: true},
  type_account: {type: DataTypes.STRING, allowNull: true},  
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  token_id: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  ds_status: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Aguardando.' },
  sing_up_step: {type: DataTypes.INTEGER, defaultValue: 1},  

}, {
  timestamps: true, // Isso gerencia createdAt e updatedAt automaticamente
  underscored: true,
  indexes: [   
    {   unique: true,
        fields: ['user_id'], 
    },
    {   unique: true,
        fields: ['token_id'], 
    },
    {   unique: true,
        fields: ['document_gateway'], 
    } 
]
});

(async () => {
  try {
      // Sincroniza a tabela com o banco de dados
      await Gateway.sync({ alter: true });
      console.log(`Tabela "${Gateway.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
  } catch (error) {
      console.error(`Erro ao sincronizar a tabela "${Gateway.name}":`, error);
  } 
})()

// Sincroniza o modelo com o banco de dados
Gateway.sync();

module.exports = Gateway;
