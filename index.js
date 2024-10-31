const express = require('express');
const initDb = require('./db/initDb'); // Importa a função de inicialização
const gatewayRoutes = require('./routes/gateway');
const userRoutes = require('./routes/user');
const transactions = require('./routes/transactions');
const documents = require('./routes/documents');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

app.use(express.json()); // Para analisar JSON

// Chama a função para inicializar o banco de dados
initDb().then(() => {
  // Use as rotas de clientes após a inicialização do DB
  app.use('/gateway', gatewayRoutes);
  app.use('/user', userRoutes);
  app.use('/transactions', transactions);
  app.use('/documents', documents);


  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });


}).catch(err => {
  console.error('Erro ao iniciar o servidor:', err);
});