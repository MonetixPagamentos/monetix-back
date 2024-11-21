const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  document: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false},
  password: { type: DataTypes.STRING, allowNull: true, },
  status: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  verificacao_email: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 }
}, {
  timestamps: true, // Isso gerencia createdAt e updatedAt automaticamente
  underscored: true,
  indexes: [   
    {   unique: true,
        fields: ['email'], 
    },
    {   unique: true,
        fields: ['document'], 
    },
    {   unique: true,
        fields: ['phone'], 
    } 
]
});

(async () => {
  try {
    // Sincroniza a tabela com o banco de dados
    await User.sync({ alter: true });
    console.log(`Tabela "${User.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
  } catch (error) {
    console.error(`Erro ao sincronizar a tabela "${User.name}":`, error);
  }
})()

// Sincroniza o modelo com o banco de dados
User.sync();

module.exports = User;
