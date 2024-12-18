const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const ProcessamentoCortex = sequelize.define('processamento_cortex', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_transaction: { type: DataTypes.STRING, allowNull: false },
  nome:  { type: DataTypes.STRING, allowNull: true },
  email:  { type: DataTypes.STRING, allowNull: true },
  cidade:  { type: DataTypes.STRING, allowNull: true },
  estado:  { type: DataTypes.STRING, allowNull: true },
  telefone:  { type: DataTypes.STRING, allowNull: true },
  produtos:  { type: DataTypes.STRING, allowNull: true },
  valor_total:  { type: DataTypes.INTEGER, allowNull: true },
  document:  { type: DataTypes.STRING, allowNull: true },  
}, {
  timestamps: true, 
  underscored: true,  
});

(async () => {
  try {
    await ProcessamentoCortex.sync({ alter: true });
    console.log(`Tabela "${ProcessamentoCortex.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
  } catch (error) {
    console.error(`Erro ao sincronizar a tabela "${ProcessamentoCortex.name}":`, error);
  }
})()


ProcessamentoCortex.sync();

module.exports = ProcessamentoCortex;
