const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Withdraw = sequelize.define('withdraw', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    token_id: { type: DataTypes.STRING, allowNull: false },
    external_id: { type: DataTypes.STRING, allowNull: false },
    end_to_end: { type: DataTypes.STRING, allowNull: true },
    id_gateway: { type: DataTypes.INTEGER, allowNull: false },
    id_user: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    document: { type: DataTypes.STRING, allowNull: false },
    receiver_name: { type: DataTypes.STRING, allowNull: false },
    pix_key: { type: DataTypes.STRING, allowNull: false },
    pix_type: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    postbackUrl_gateway: { type: DataTypes.STRING, allowNull: false },
    postbackUrl: { type: DataTypes.STRING, allowNull: false },
    payment_date: { type: DataTypes.DATE, allowNull: true },
    type: { type: DataTypes.STRING, default: 'SALDO' }
}, {
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['id_gateway'],
        }
    ]
});

(async () => {
    try {
        // Sincroniza a tabela com o banco de dados
        await Withdraw.sync({ alter: true });
        console.log(`Tabela "${Withdraw.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
    } catch (error) {
        console.error(`Erro ao sincronizar a tabela "${Withdraw.name}":`, error);
    }
})()

Withdraw.sync();

module.exports = Withdraw;
