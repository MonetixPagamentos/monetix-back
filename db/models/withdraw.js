const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Withdraw = sequelize.define('withdraw', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    token_id: { type: DataTypes.STRING, allowNull: false},
    external_id: { type: DataTypes.STRING, allowNull: false},
    end_to_end: { type: DataTypes.STRING, allowNull: true},
    id_gateway: { type: DataTypes.INTEGER, allowNull: false },
    id_user: { type: DataTypes.INTEGER, allowNull: false },
    amount: {  type: DataTypes.DECIMAL(10, 2), allowNull: false },
    document: { type: DataTypes.STRING, allowNull: false },
    receiver_name: { type: DataTypes.STRING, allowNull: false },
    pix_key: { type: DataTypes.STRING, allowNull: false },
    pix_type: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false},
    postbackUrl_gateway: { type: DataTypes.STRING, allowNull: false},    
    postbackUrl: { type: DataTypes.STRING, allowNull: false}        
}, {
    timestamps: true,
    underscored: true,
});

Withdraw.sync();

module.exports = Withdraw;
