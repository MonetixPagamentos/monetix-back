const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const IACortex = sequelize.define('iacortex', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_transaction: { type: DataTypes.INTEGER},
    integridade: { type: DataTypes.INTEGER},
    justificativa: { type: DataTypes.TEXT},  
  }, {
    timestamps: true,
    underscored: true,
    indexes: [
      {   
          fields: ['id_transaction'], 
      }
  ]
  });
  
  (async () => {
    try {
      
        await IACortex.sync({ alter: true });
        console.log(`Tabela "${IACortex.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
    } catch (error) {
        console.error(`Erro ao sincronizar a tabela "${IACortex.name}":`, error);
    } 
  })()
 
IACortex.sync();


module.exports = IACortex;