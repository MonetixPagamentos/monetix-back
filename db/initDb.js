const sequelize = require('./connection');
const Gateway = require('./models/gateway');
const User = require('./models/user');
const Transactions = require('./models/transactions');
const Documents = require('./models/documents');
const Token = require('./models/tokens');
const SaldoGateway = require('./models/saldoGateway');
const TaxaGateway = require('./models/taxaGateway');

const initDb = async () => {
  try {
    // Sincroniza o modelo com o banco de dados
    await Gateway.sync();
    await User.sync();
    await Transactions.sync();
    await Documents.sync();
    await Token.sync();
    await SaldoGateway.sync();
    await TaxaGateway.sync();

    // Chama a função para alterar a tabela
    await alterGatewayTable();
    await alterUserTable();
    await alterTransactionsTable();
    await alterDocumentTable();
    await alterTokenTable();
    await alterGatewayTable();
    await alterTaxaGatewayTable();

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


const alterTransactionsTable = async () => {
  try {
    if(true){
      return;
    }
    // aqui montar alteração se precisar
    // await sequelize.query('ALTER TABLE `user` CHANGE `email` `emails` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;');
    console.log('Campo document_gateway alterado com sucesso.');
  } catch (err) {
    console.error('Erro ao alterar tabela clientes:', err);
  }
};

const alterDocumentTable = async () => {
  try {
    if(true){
      return;
    }
    //  aqui montar alteração se precisar
    // await sequelize.query('ALTER TABLE `user` CHANGE `email` `emails` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;');
    console.log('Campo document_gateway alterado com sucesso.');
  } catch (err) {
    console.error('Erro ao alterar tabela clientes:', err);
  }
};

const alterTokenTable = async () => {
  try {
    if(true){
      return;
    }
    //  aqui montar alteração se precisar
    // await sequelize.query('ALTER TABLE `user` CHANGE `email` `emails` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;');
    console.log('Campo document_gateway alterado com sucesso.');
  } catch (err) {
    console.error('Erro ao alterar tabela clientes:', err);
  }
};

const alterSaldoGatewayTable = async () => {
  try {
    if(true){
      return;
    }
    //  aqui montar alteração se precisar
    // await sequelize.query('ALTER TABLE `user` CHANGE `email` `emails` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;');
    console.log('Campo document_gateway alterado com sucesso.');
  } catch (err) {
    console.error('Erro ao alterar tabela clientes:', err);
  }
};

const alterTaxaGatewayTable = async () => {
  try {
    if(true){
      return;
    }
    //  aqui montar alteração se precisar
    // await sequelize.query('ALTER TABLE `user` CHANGE `email` `emails` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;');
    console.log('Campo document_gateway alterado com sucesso.');
  } catch (err) {
    console.error('Erro ao alterar tabela clientes:', err);
  }
};



module.exports = initDb;
