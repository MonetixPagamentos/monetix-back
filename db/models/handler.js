const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Handler = sequelize.define('handler', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, },
    version: {type: DataTypes.INTEGER},
    executed: {type: DataTypes.INTEGER, defaultValue: 0},           
},{
  timestamps: true, 
  underscored: true,
});

(async () => {
  try {
      // Sincroniza a tabela com o banco de dados
      await Handler.sync({ alter: true });
      console.log(`Tabela "${Handler.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
  } catch (error) {
      console.error(`Erro ao sincronizar a tabela "${Handler.name}":`, error);
  } 
})();

Handler.sync();

module.exports = Handler;




