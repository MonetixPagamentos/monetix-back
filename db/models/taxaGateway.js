const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');
 
const TaxaGateway = sequelize.define('taxa_gateway', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    taxa_pix: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa padrão para PIX
    taxa_cartao_1: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 1
    taxa_cartao_2: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 2
    taxa_cartao_3: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 3
    taxa_cartao_4: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 4
    taxa_cartao_5: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 5
    taxa_cartao_6: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 6
    taxa_cartao_7: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 7
    taxa_cartao_8: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 8
    taxa_cartao_9: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 9
    taxa_cartao_10: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 10
    taxa_cartao_11: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 11
    taxa_cartao_12: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa do cartão 12
    taxa_boleto: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa para boleto
    taxa_reserva: { type: DataTypes.INTEGER, defaultValue: 2 }, // Taxa de reserva
    taxa_transacao: { type: DataTypes.INTEGER, defaultValue: 200 }, // Taxa de transação padrão
    taxa_saque: { type: DataTypes.INTEGER, defaultValue: 200 }, // Taxa de saque padrão
    id_gateway: { type: DataTypes.INTEGER, allowNull: false }, // ID do gateway
    id_user: { type: DataTypes.INTEGER, allowNull: false }, // ID do usuário
}, {
    timestamps: true, // Adiciona os campos de timestamps (createdAt, updatedAt)
    underscored: true, // Utiliza o padrão de nomenclatura com underscores
});

(async () => {
    try {
        // Sincroniza a tabela com o banco de dados
        await TaxaGateway.sync({ alter: true });
        console.log(`Tabela "${TaxaGateway.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
    } catch (error) {
        console.error(`Erro ao sincronizar a tabela "${TaxaGateway.name}":`, error);
    } 
  })()

// Sincroniza o modelo com o banco de dados
TaxaGateway.sync();

module.exports = TaxaGateway;
