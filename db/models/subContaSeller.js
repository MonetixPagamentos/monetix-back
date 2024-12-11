const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const SubContaSeller = sequelize.define('subconta_seller', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_gateway: { type: DataTypes.INTEGER, allowNull: false },    
    id_seller: {type: DataTypes.STRING},
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
    motivo_status: { type: DataTypes.STRING, allowNull: true },
    integridade: {type: DataTypes.INTEGER},    
    agencia: {type: DataTypes.STRING},    
    conta: {type: DataTypes.STRING},
    banco: {type: DataTypes.STRING},
    pix_key: {type: DataTypes.STRING}    
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
        await SubContaSeller.sync({ alter: true });
        console.log(`Tabela "${SubContaSeller.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
    } catch (error) {
        console.error(`Erro ao sincronizar a tabela "${SubContaSeller.name}":`, error);
    }
})()

SubContaSeller.sync();

module.exports = SubContaSeller;
