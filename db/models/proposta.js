const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Proposta = sequelize.define('proposta', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING},
    email: { type: DataTypes.STRING}, 
    telefone: { type: DataTypes.STRING }, 
    cpf: { type: DataTypes.STRING}, 
    dt_nasc: { type: DataTypes.STRING}, 
    nome_mae: { type: DataTypes.STRING}, 
    razao_social: { type: DataTypes.STRING}, 
    nome_fantasia: { type: DataTypes.STRING},
    cnpj: { type: DataTypes.STRING}, 
    dt_abertura: { type: DataTypes.STRING}, 
    ticket_medio_mes: { type: DataTypes.STRING}, 
    cep: { type: DataTypes.STRING}, 
    rua: { type: DataTypes.STRING}, 
    bairro: { type: DataTypes.STRING},
    cidade: { type: DataTypes.STRING},
    estado: { type: DataTypes.STRING }, 
    pais: { type: DataTypes.STRING }, 
    complemento: { type: DataTypes.STRING}, 
    numero: { type: DataTypes.STRING }, 
    banco: { type: DataTypes.STRING }, 
    agencia: { type: DataTypes.STRING },
    conta: { type: DataTypes.STRING }, 
    tipo_conta: { type: DataTypes.STRING}, 
    tipo_servico: { type: DataTypes.STRING}, 
}, {
    timestamps: true, 
    underscored: true, 
    
});

(async () => {
    try {
        await Proposta.sync({ alter: true });
        console.log(`Tabela "${Proposta.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
    } catch (error) {
        console.error(`Erro ao sincronizar a tabela "${Proposta.name}":`, error);
    }
})()

Proposta.sync();

module.exports = Proposta;
