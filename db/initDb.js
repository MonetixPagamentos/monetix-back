const sequelize = require('./connection');
const Gateway = require('./models/gateway');
const User = require('./models/user');
const Transactions = require('./models/transactions');
const Documents = require('./models/documents');
const Token = require('./models/tokens');
const SaldoGateway = require('./models/saldoGateway');
const TaxaGateway = require('./models/taxaGateway');
const SubContaSeller = require('./models/subContaSeller');
const Handler = require('./models/handler');
const Withdraw = require('./models/withdraw');
const TransactionItem = require('./models/transactionItem');
const { version } = require('@babel/core');


const initDb = async () => {
  try {
    Handler.sync();
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
    await Handler.sync();
    await TransactionItem.sync();
    
    await handlerDatabase();    

  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  }
};

const handlerDatabase = async () => {
  try {
    var oldVersion = 3;
    var updated = false;
    if(oldVersion <= 0){
      updated =  true;
    }
    if (oldVersion < 1) {        
      await sequelize.query('ALTER TABLE `transactions` ADD COLUMN `link_origem` VARCHAR(255);');
      updated =  true;
    }   

    if (oldVersion < 2) {        
      await sequelize.query('ALTER TABLE `transactions` ADD COLUMN `updated_balance` INTEGER;');
      updated =  true;
    }

    if (oldVersion < 3) {        
      await sequelize.query('ALTER TABLE `saldo_gateways` ADD COLUMN `id_seller` INTEGER;');
      updated =  true;
    }
    

    if(updated){
      var newVersion = oldVersion + 1;
      await Handler.create({
        version: newVersion
      });
    }
    
  } catch (err) {
    console.error('Erro ao alterar tabela clientes:', err);
  }
};

module.exports = initDb;
