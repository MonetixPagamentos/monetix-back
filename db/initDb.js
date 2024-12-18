const sequelize = require('./connection');
const Gateway = require('./models/gateway');
const User = require('./models/user');
const Transactions = require('./models/transactions');
const Documents = require('./models/documents');
const Token = require('./models/tokens');
const SaldoGateway = require('./models/saldoGateway');
const TaxaGateway = require('./models/taxaGateway');
const SubContaSeller = require('./models/subContaSeller');
const Withdraw = require('./models/withdraw');
const TransactionItem = require('./models/transactionItem');
const UserAdm = require('./models/userAdm');
const IACortex = require('./models/IACortex');
const { version } = require('@babel/core');
const ProcessamentoCortex = require('./models/processamento_cortex');

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
    await SubContaSeller.sync();
    await Withdraw.sync();
    await SubContaSeller.sync();   
    await TransactionItem.sync();
    await UserAdm.sync();
    await IACortex.sync();
    await ProcessamentoCortex.sync();
    
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  }
};

module.exports = initDb;
