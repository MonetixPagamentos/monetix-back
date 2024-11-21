const express = require('express');
const User = require('../db/models/user'); // Importa o modelo Cliente
const router = express.Router();
const enviarEmail = require('../components/email');

// Rota para criar um novo cliente
router.post('/novo-user', async (req, res) => {
  try {
    const { name,
      email,
      document,
      phone,
      password
    } = req.body;

    const user = await User.create({ 
      name,
      email,
      document,
      phone,
      password
    });

    const textEmail = process.env.API_BASE_URL +`/email/ativacao-user/${user.id}`
    try {
        await enviarEmail(email, 'Ativação de conta', textEmail);
        //return res.status(200).json({ message: 'Email sent successfully' });
        console.log('enviou email de validacao');
    } catch (error) {
      console.log('erro no envio, email de validacao');
        return res.status(500).json({ error: error.message || 'Failed to send email' });
    }

    res.status(201).json({id: user.id});
    
  } catch (err) {
    if (err.parent.code === 'ER_DUP_ENTRY') {
      console.log('retorno: ' + err.parent.code );
      return res.status(409).json({ retorno: err.parent.code });
    }
    console.log(err)
    res.status(500).send(err);
  }
});

// Rota para listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const user = await User.findAll();
    res.json(client);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Rota para alterar um gateway
router.put('/alterar-Uuer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { bussines_name,
      business_opening_date,
      statement_descriptor, 
      middle_ticket, 
      zip_code, 
      street, 
      number, 
      city, 
      state, 
      district, 
      contry, 
      ownew, 
      document_responsable, 
      phone_responsable, 
      email_responsable } = req.body;
    await User.update({ bussines_name,
      business_opening_date,
      statement_descriptor, 
      middle_ticket, 
      zip_code, 
      street, 
      number, 
      city, 
      state, 
      district, 
      contry, 
      ownew, 
      document_responsable, 
      phone_responsable, 
      email_responsable }, { where: { id } });
    res.json({ mensagem: 'Gateway atualizado com sucesso!' });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Rota para excluir um gateway
router.delete('/excluir-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Gateway.destroy({ where: { id } });
    res.json({ mensagem: 'User excluído com sucesso!' });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;


/*
91fb3-91651
394d3-6398b
5ee7f-a4bfc
d2490-40ad2
c7748-428fd
5b129-da5f1
65449-a80f6
5dd7a-1198b
9888c-0af65
c9162-f99b5
9d217-e71df
48fdf-3d3f3
35849-4414c
a4b1a-0a06c
f0c0a-323ec
6f224-226d8

*/