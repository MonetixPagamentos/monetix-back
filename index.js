const express = require('express');
const initDb = require('./db/initDb'); // Importa a função de inicialização
const gatewayRoutes = require('./routes/gateway');
const userRoutes = require('./routes/user');
const transactions = require('./routes/transactions');
const documents = require('./routes/documents');
const User = require('./db/models/user');
const Gateway = require('./db/models/gateway');
const Documents = require('./db/models/documents');
const setupSwagger = require('./swagger'); 
const cors = require('cors');
const app = express();

app.use(cors());
const port = 3000;
setupSwagger(app);

app.use(express.json()); // Para analisar JSON

// Chama a função para inicializar o banco de dados
initDb().then(() => {
  // Use as rotas de clientes após a inicialização do DB
  app.use('/gateway', gatewayRoutes);
  app.use('/user', userRoutes);
  app.use('/transactions', transactions);
  app.use('/documento', documents);


  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.post('/login', async (req, res) => {
    try {
      const { email, senha } = req.body;

      let existe_gateway = false;
      let id_gateway = null;
      let token_gateway = null;
      let status_gateway = null;
      let existe_documento = false;
      let status_documento = null;

      const user = await User.findOne({ where: { email: email } });

      if (user && senha === user.password) {
        console.log('Usuário encontrado e senha válida:', user);

        const gateway = await Gateway.findOne({ where: { user_id: user.id } });

        if (gateway) {
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
          status_documento: status_documento
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