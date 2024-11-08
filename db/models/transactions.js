const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Transactions = sequelize.define('transactions', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_seller: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DOUBLE, allowNull: false }, // Valor da transação
    cardNumber: { type: DataTypes.STRING, allowNull: false }, // Número de cartão
    cvv: { type: DataTypes.INTEGER, allowNull: false }, // Código de segurança
    description: { type: DataTypes.STRING, allowNull: true }, // Descrição da transação
    expirationDate: { type: DataTypes.STRING, allowNull: false }, // Data de validade do cartão
    idOriginTransaction: { type: DataTypes.STRING, allowNull: false }, // Identificação do fundo
    nameCreditCard: { type: DataTypes.STRING, allowNull: false }, // Nome no cartão de crédito
    numbersInstallments: { type: DataTypes.BIGINT, allowNull: false }, // Número de parcelas
    typePayment: { type: DataTypes.STRING, allowNull: false }, // Forma de pagamento do cartão    
    payment_method: { type: DataTypes.STRING, allowNull: false },
    token_gateway: { type: DataTypes.STRING, allowNull: false },
    id_gateway: { type: DataTypes.INTEGER, allowNull: false },
        
    // Campos de retorno
    external_id: { type: DataTypes.STRING, allowNull: true }, // Código de autorização
    end_to_end: { type: DataTypes.STRING, allowNull: true},
    authorizationCode: { type: DataTypes.STRING, allowNull: true }, // Código de autorização
    creditCardId: { type: DataTypes.BIGINT, allowNull: true }, // Id da transação
    identificationTransaction: { type: DataTypes.STRING, allowNull: true }, // Identificador de transação
    identificationTransactionCanceled: { type: DataTypes.STRING, allowNull: true }, // Identificador de transação cancelada
    status: { type: DataTypes.STRING, allowNull: true }, // Status da transação
    link_origem: { type: DataTypes.STRING, allowNull: false },
}, {
    timestamps: true, // Isso gerencia createdAt e updatedAt automaticamente
    underscored: true,
});

Transactions.sync();
module.exports = Transactions;
