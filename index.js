const express = require('express');
const initDb = require('./db/initDb'); // Importa a função de inicialização
const gatewayRoutes = require('./routes/gateway');
const userRoutes = require('./routes/user');
const transactions = require('./routes/transactions');
const documents = require('./routes/documents');
const withdraw = require('./routes/withdraw');
const subContaSeller = require('./routes/subContaSeller');
const User = require('./db/models/user');
const Gateway = require('./db/models/gateway');
const Documents = require('./db/models/documents');
const dashboard = require('./routes/dashboard');
const setupSwagger = require('./swagger'); 
const cors = require('cors');
const app = express();

app.use(cors());
const port = 3001;
setupSwagger(app);

app.use(express.json()); // Para analisar JSON

// Chama a função para inicializar o banco de dados
initDb().then(() => {
  // Use as rotas de clientes após a inicialização do DB
  app.use('/gateway', gatewayRoutes);
  app.use('/user', userRoutes);
  app.use('/transactions', transactions);
  app.use('/documento', documents);
  app.use('/withdraw', withdraw);
  app.use('/seller', subContaSeller);
  app.use('/dashboard', dashboard);

  //app.use('/pix', pix);
  
  app.get('/', (req, res) => {
    res.send('API MONETIX :D');
  });

  app.post('/login', async (req, res) => {
    try {
      const { email, senha } = req.body;

      var existe_gateway = false;
      var id_gateway = null;
      var token_gateway = null;
      var status_gateway = null;
      var existe_documento = false;
      var status_documento = null;
      var sing_up_step = null;

      const user = await User.findOne({ where: { email: email } });

      if (user && senha === user.password) {
        console.log('Usuário encontrado e senha válida:', user);

        const gateway = await Gateway.findOne({ where: { user_id: user.id } });
        sing_up_step = gateway.sing_up_step;

        if (gateway && sing_up_step == 4) {
          existe_gateway = gateway ? true : false;
          id_gateway = gateway.id;
          token_gateway = gateway.token_id;
          status_gateway = gateway.status;

          const doc = await Documents.findOne({ where: { id_gateway: id_gateway } });

          if (doc) {
            existe_documento = doc ? true : false;
            status_documento = doc.status;
          }
        }

        res.status(201).json({
          email: user.email,
          id_user: user.id,
          existe_gateway: existe_gateway,
          id_gateway: id_gateway,
          token_gateway: token_gateway,
          status_gateway: status_gateway,
          existe_documento: existe_documento,
          status_documento: status_documento,
          sing_up_step: sing_up_step
        });


      } else {
        res.status(404).json({message: "usuario não encontrado"});
      }
    } catch (error) {
      console.log(error);
    }

  });

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });


}).catch(err => {
  console.error('Erro ao iniciar o servidor:', err);
});