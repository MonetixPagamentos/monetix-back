const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Transactions = sequelize.define('transactions', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_seller: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false }, // Valor da transação
    cardNumber: { type: DataTypes.STRING, allowNull: true }, // Número de cartão
    cvv: { type: DataTypes.INTEGER, allowNull: true }, // Código de segurança
    description: { type: DataTypes.STRING, allowNull: true }, // Descrição da transação
    expirationDate: { type: DataTypes.STRING, allowNull: true }, // Data de validade do cartão
    idOriginTransaction: { type: DataTypes.STRING, allowNull: false }, // Identificação do fundo
    name: { type: DataTypes.STRING, allowNull: false }, // Nome no cartão de crédito ou do comprador (em caso de pix)
    numbersInstallments: { type: DataTypes.BIGINT, allowNull: true }, // Número de parcelas
    typePayment: { type: DataTypes.STRING, allowNull: true }, // Forma de pagamento do cartão    
    payment_method: { type: DataTypes.STRING, allowNull: false },
    token_gateway: { type: DataTypes.STRING, allowNull: false },
    id_gateway: { type: DataTypes.INTEGER, allowNull: false },
    postback_url :{ type: DataTypes.STRING, allowNull: false},
    integridade: { type: DataTypes.INTEGER, default: 0 }, 

    //payment_date: {type: DataTypes.DATE, allowNull: true},
    // Campos de retorno
    external_id: { type: DataTypes.STRING, allowNull: true }, // Código de autorização
    end_to_end: { type: DataTypes.STRING, allowNull: true},
    authorizationCode: { type: DataTypes.STRING, allowNull: true }, // Código de autorização
    creditCardId: { type: DataTypes.INTEGER, allowNull: true }, // Id da transação
    identificationTransaction: { type: DataTypes.STRING, allowNull: true }, // Identificador de transação
    identificationTransactionCanceled: { type: DataTypes.STRING, allowNull: true }, // Identificador de transação cancelada
    status: { type: DataTypes.STRING, allowNull: true }, // Status da transação
    link_origem: { type: DataTypes.STRING, allowNull: false },
    updated_balance: { type: DataTypes.INTEGER, defaultValue: 0 },

    // pix

    keyPix: { type: DataTypes.STRING, allowNull: true, comment: 'Key PIX' },
    merchantName: { type: DataTypes.STRING, allowNull: true, comment: 'Name of the establishment or individual PIX' },
    merchantCity: { type: DataTypes.STRING, allowNull: true, comment: 'Name of the city where the pix was generated PIX' },    
    txid: { type: DataTypes.STRING, allowNull: true, comment: 'Unique PIX billing identifier' }

}, {
    timestamps: true, // Isso gerencia createdAt e updatedAt automaticamente
    underscored: true,
});

(async () => {
    try {
        // Sincroniza a tabela com o banco de dados
        await Transactions.sync({ alter: true });
        console.log(`Tabela "${Transactions.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
    } catch (error) {
        console.error(`Erro ao sincronizar a tabela "${Transactions.name}":`, error);
    } 
  })()

Transactions.sync();
module.exports = Transactions;
