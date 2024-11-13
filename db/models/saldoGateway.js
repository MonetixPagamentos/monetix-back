const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');
const SubContaSeller = require('./subContaSeller');

const SaldoGateway = sequelize.define('saldoGateway', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    val_disponivel: {  type: DataTypes.INTEGER, defaultValue: 0 },
    val_reserva: { type: DataTypes.INTEGER, defaultValue: 0 },
    val_saque: { type: DataTypes.INTEGER, defaultValue: 0 },
    id_gateway: { type: DataTypes.INTEGER, allowNull: false },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
    id_seller:{ type: DataTypes.INTEGER, allowNull: false }, 
}, {
    timestamps: true, 
    underscored: true, 
});

SaldoGateway.sync();

module.exports = SaldoGateway;