const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');
const { checkDuplicateIncludeExcludes } = require('@babel/preset-env/lib/normalize-options');

const Transactions = sequelize.define('transactions', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_seller: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false }, // Valor da transação
    cardNumber: { type: DataTypes.STRING, allowNull: true }, // Número de cartão
    cvv: { type: DataTypes.INTEGER, allowNull: true }, // Código de segurança
    description: { type: DataTypes.STRING, allowNull: true }, // Descrição da transação
    expirationDate: { type: DataTypes.STRING, allowNull: true }, // Data de validade do cartão
    idOriginTransaction: { type: DataTypes.STRING, allowNull: true }, // Identificação do fundo
    name: { type: DataTypes.STRING, allowNull: false }, // Nome no cartão de crédito ou do comprador (em caso de pix)
    numbersInstallments: { type: DataTypes.BIGINT, allowNull: true }, // Número de parcelas
    typePayment: { type: DataTypes.STRING, allowNull: true }, // Forma de pagamento do cartão    
    payment_method: { type: DataTypes.STRING, allowNull: false },
    token_gateway: { type: DataTypes.STRING, allowNull: false },
    id_gateway: { type: DataTypes.INTEGER, allowNull: false },
    postback_url :{ type: DataTypes.STRING, allowNull: true},
    integridade: { type: DataTypes.INTEGER, default: 0 }, 
    phone: { type: DataTypes.STRING, allowNull: true }, 
    document: { type: DataTypes.STRING, allowNull: true }, 

    email:{ type: DataTypes.STRING},
    city:{ type: DataTypes.STRING},
    uf:{ type: DataTypes.STRING},
    country:{ type: DataTypes.STRING},

    //payment_date: {type: DataTypes.DATE, allowNull: true},
    // Campos de retorno
    external_id: { type: DataTypes.TEXT, allowNull: true }, // Código de autorização
    end_to_end: { type: DataTypes.TEXT, allowNull: true},
    authorizationCode: { type: DataTypes.STRING, allowNull: true }, // Código de autorização
    creditCardId: { type: DataTypes.INTEGER, allowNull: true }, // Id da transação
    identificationTransaction: { type: DataTypes.TEXT, allowNull: true }, // Identificador de transação
    identificationTransactionCanceled: { type: DataTypes.TEXT, allowNull: true }, // Identificador de transação cancelada
    status: { type: DataTypes.TEXT, allowNull: true }, // Status da transação
    link_origem: { type: DataTypes.TEXT, allowNull: true },
    updated_balance: { type: DataTypes.INTEGER, defaultValue: 0 },

    // pix  
    txid: { type: DataTypes.TEXT, allowNull: true, comment: 'Unique PIX billing identifier' }

}, {
    timestamps: true, // Isso gerencia createdAt e updatedAt automaticamente
    underscored: true,
    indexes: [
        {
            fields: ['status'],
        },
        {
            fields: ['created_at'], 
        },
        {
            fields: ['id_gateway'], 
        },
        {
            fields: ['payment_method'], 
        },
        {
            fields: ['status', 'created_at', 'id_gateway', 'payment_method'], 
        }
    ]
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
