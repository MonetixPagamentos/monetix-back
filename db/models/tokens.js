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

(async () => {
  try {
      // Sincroniza a tabela com o banco de dados
      await Token.sync({ alter: true });
      console.log(`Tabela "${Token.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
  } catch (error) {
      console.error(`Erro ao sincronizar a tabela "${Token.name}":`, error);
  } 
})()
// Sincroniza o modelo com o banco de dados
Token.sync();

module.exports = Token;