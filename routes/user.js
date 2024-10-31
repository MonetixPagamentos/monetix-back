const express = require('express');
const User = require('../db/models/user'); // Importa o modelo Cliente
const router = express.Router();

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
