const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const PreCharge = sequelize.define('pre_charge', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_transaction: { type: DataTypes.INTEGER },
    id_seller: { type: DataTypes.STRING},
    external_id: { type: DataTypes.STRING}, 
    token_gateway: { type: DataTypes.STRING }, 
    vlr_pre_charge: { type: DataTypes.INTEGER },
    pago: { type: DataTypes.STRING }, 

}, {
    timestamps: true, 
    underscored: true, 
    
});

(async () => {
    try {
        await PreCharge.sync({ alter: true });
        console.log(`Tabela "${PreCharge.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
    } catch (error) {
        console.error(`Erro ao sincronizar a tabela "${PreCharge.name}":`, error);
    }
})()

PreCharge.sync();

module.exports = PreCharge;
