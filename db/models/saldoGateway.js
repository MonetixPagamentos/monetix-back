//const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');
const { Sequelize, DataTypes } = require('sequelize');

const SaldoGateway = sequelize.define('saldoGateway', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    val_disponivel: { type: DataTypes.INTEGER, defaultValue: 0 },
    val_reserva: { type: DataTypes.INTEGER, defaultValue: 0 },
    val_saque: { type: DataTypes.INTEGER, defaultValue: 0 },
    val_saque_reserva: { type: DataTypes.INTEGER, defaultValue: 0 },
    id_gateway: { type: DataTypes.INTEGER, allowNull: false },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
    id_seller: { type: DataTypes.STRING, allowNull: false },
}, {
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['id_gateway'],
        },
        {
            fields: ['id_seller'],
        }
    ]
});

(async () => {
    try {
        // Sincroniza a tabela com o banco de dados
        await SaldoGateway.sync({ alter: true });
        console.log(`Tabela "${SaldoGateway.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
    } catch (error) {
        console.error(`Erro ao sincronizar a tabela "${SaldoGateway.name}":`, error);
    }
})()

SaldoGateway.sync();

module.exports = SaldoGateway;