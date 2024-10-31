const Gateway = require('./models/gateway');
const User = require('./models/user');
const sequelize = require('./connection');

const initDb = async () => {
  try {
    // Sincroniza o modelo com o banco de dados
    await Gateway.sync();
    await User.sync();

    // Chama a função para alterar a tabela
    await alterGatewayTable();
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  }
};

// Função para alterar o campo da tabela clientes
const alterGatewayTable = async () => {
  try {
    if(true){
      return;
    }
    // Alterar o campo telefone para permitir mais caracteres
    await sequelize.query('ALTER TABLE `gateways` CHANGE `documento_gateway` `document_gateway` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;');
    console.log('Campo document_gateway alterado com sucesso.');
  } catch (err) {
    console.error('Erro ao alterar tabela clientes:', err);
  }
};

const alterUserTable = async () => {
  try {
    if(true){
      return;
    }
    // Alterar o campo telefone para permitir mais caracteres
    await sequelize.query('ALTER TABLE `user` CHANGE `email` `emails` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;');
    console.log('Campo document_gateway alterado com sucesso.');
  } catch (err) {
    console.error('Erro ao alterar tabela clientes:', err);
  }
};

module.exports = initDb;
