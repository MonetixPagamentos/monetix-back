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
const painelAdm = require('./routes/painelAdm');
const email = require('./routes/email');
const pix = require('./routes/pix');
const userAdm = require('./db/models/userAdm');
const docs = require('./routes/docs');
const setupSwagger = require('./swagger');

const cron = require('node-cron');

const cors = require('cors');
const { atualizaSaldo24 } = require('./components/functions');

const app = express();

app.use(cors());
const port = 3000;
setupSwagger(app);

app.use(express.json());

/* 21/11/2024 10:46

   pra que serve tandos codigos?
   a vida não é programada 
   e as melhores coisas não tem logica! 
   
*/

initDb().then(() => {

  app.use('/gateway', gatewayRoutes);
  app.use('/user', userRoutes);
  app.use('/transactions', transactions);
  app.use('/documento', documents);
  app.use('/withdraw', withdraw);
  app.use('/seller', subContaSeller);
  app.use('/dashboard', dashboard);
  app.use('/painel', painelAdm);
  app.use('/email', email);
  app.use('/pix', pix);
  app.use('/docs', docs);
  
  app.post('/teste-postback',(req,res) => {
    console.log(req.body)
  });

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

      if (user && user.status == 0 && user.verificacao_email == 0) {
        return res.status(403).json({ message: "Verifique sua caixa de e-mail para confirmação da conta!" });
      }

      if (user && user.status == 0) {
        return res.status(403).json({ message: "Usuario inativo, entre em contato com seu gerente de conta!" });
      }

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
          sing_up_step: sing_up_step,
          name: user.name,
          phone: user.phone
        });


      } else {
        return res.status(501).json({ message: "Senha inválida!" });
      }
    } catch (error) {
      console.log(error);
    }

  });

  app.post('/login-adm', async (req, res) => {
    try {
      const { email, senha } = req.body;
      const UserAdm = await userAdm.findOne({ where: { email: email } });

      if (!UserAdm) {
        return res.status(403).json({ message: "Usuario não existe!" });
      }

      if (UserAdm && senha === UserAdm.password) {
        res.status(201).json({ id: UserAdm.id, name: UserAdm.name });

      } else {
        return res.status(501).json({ message: "usuario não encontrado" });
      }
    } catch (error) {
      console.log(error);
    }

  });

   const func = () => {
     atualizaSaldo24()
   };

   cron.schedule('0 0 * * 1-5', func, {
    timezone: 'America/Sao_Paulo'
  });
  

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });


}).catch(err => {
  console.error('Erro ao iniciar o servidor:', err);
});