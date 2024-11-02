const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const SubContaSeller = sequelize.define('subconta_seller', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_seller: { type: DataTypes.INTEGER, allowNull: false },
    id_gateway: { type: DataTypes.INTEGER, allowNull: false },
    nome_fantasia: { type: DataTypes.STRING, allowNull: false },
    razao_social: { type: DataTypes.STRING, allowNull: false },
    cnpj: { type: DataTypes.STRING, allowNull: false },
    telefone: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false },
    ticket_medio: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    numero: { type: DataTypes.STRING, allowNull: true },
    complemento: { type: DataTypes.STRING, allowNull: true },
    rua: { type: DataTypes.STRING, allowNull: true },
    bairro: { type: DataTypes.STRING, allowNull: true },
    cidade: { type: DataTypes.STRING, allowNull: true },
    estado: { type: DataTypes.STRING, allowNull: true },
    pais: { type: DataTypes.STRING, allowNull: true },
    cpf: { type: DataTypes.STRING, allowNull: true },
    nome_mae: { type: DataTypes.STRING, allowNull: true },
    data_nascimento: { type: DataTypes.DATE, allowNull: true },
    postbackUrl: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false },
    motivo_status: { type: DataTypes.STRING, allowNull: true }
},{
    timestamps: true,
    underscored: true,
});


SubContaSeller.sync();

module.exports = SubContaSeller;
