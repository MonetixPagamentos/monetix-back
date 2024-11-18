const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const TransactionItem = sequelize.define('transaction_item', {    
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_transaction: { type: DataTypes.INTEGER, allowNull: false},
    id_gateway: { type: DataTypes.INTEGER, allowNull: false},
    description: { type: DataTypes.STRING, allowNull: false},
    amount: { type: DataTypes.INTEGER, allowNull: false },
    qtde: { type: DataTypes.INTEGER, allowNull: false },
}, {
    timestamps: true, // Isso gerencia createdAt e updatedAt automaticamente
    underscored: true,
});

(async () => {
    try {
        // Sincroniza a tabela com o banco de dados
        await TransactionItem.sync({ alter: true });
        console.log(`Tabela "${TransactionItem.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
    } catch (error) {
        console.error(`Erro ao sincronizar a tabela "${TransactionItem.name}":`, error);
    } 
  })()

TransactionItem.sync();
module.exports = TransactionItem;