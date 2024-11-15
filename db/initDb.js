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
    const exiteHandler = await Handler.findOne({where:{executed: 1}});  
    var updated = false;

    if(!exiteHandler)
      await Handler.create({version: 0, executed: 1});
    
    var maxHandler = await Handler.max('version',{where:{executed: 1}});  
    const handler  = await Handler.findOne({where:{version: maxHandler}});  

    if(handler.version <= 0 && handler.executed == 0){
       // COMANDO A EXECUTAR NA BASE
       updated = true;
       newVersion = handler.version + 1;
    }  

    if(updated){
      var newVersion = 0;
      await Handler.create({
         version: 99
      });
    }
    
  } catch (err) {
    console.error('Erro ao alterar tabela clientes:', err);
  }
};

module.exports = initDb;
