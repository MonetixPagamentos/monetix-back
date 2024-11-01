const express = require('express');
const { v4: uuidv4 } = require('uuid'); // Importando a função v4 do uuid
const Gateway = require('../db/models/gateway'); // Importa o modelo Cliente
const SaldoGateway = require('../db/models/saldoGateway');
const TaxaGateway = require('../db/models/taxaGateway');
const Token = require('../db/models/tokens');

const router = express.Router();

// Rota para criar um novo cliente
router.post('/novo-gateway/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { gateway_name,
      document_gateway,
      business_opening_date,
      statement_descriptor,
      middle_ticket,
      zip_code,
      street,
      number,
      city,
      state,
      district,
      country,
      ownew,
      document_responsable,
      phone_responsable,
      email_responsable } = req.body;

    const token_id = uuidv4(); // Gerando um UUID

    const gateway = await Gateway.create({
      gateway_name,
      document_gateway,
      business_opening_date,
      statement_descriptor,
      middle_ticket,
      zip_code,
      street,
      number,
      city,
      state,
      district,
      country,
      ownew,
      document_responsable,
      phone_responsable,
      email_responsable,
      user_id: userId,
      token_id: token_id,
      status: 0,
      ds_status: 'Aguardando.'
    });
    
    if (gateway && gateway.id) {
      
      await Token.create({
        token: token_id,
        id_gateway: gateway.id        
      });

      await SaldoGateway.create({
        val_disponivel: 0,
        val_reserva: 0,
        id_gateway: gateway.id,
        id_usuario: gateway.user_id
      });

      await TaxaGateway.create({        
        id_gateway: gateway.id, 
        id_user: gateway.user_id
      });
    }

    res.status(201).json({
      token_id: gateway.token_id,
      user_id: gateway.user_id,
      gateway_id: gateway.id
    });
  } catch (err) {
    if (err.parent.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'CNPJ já adicionado.' });
    }
    console.log(err)
    res.status(500).send(err);
  }
});

// Rota para listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const gateway = await Gateway.findAll();
    res.json(gateway);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Rota para alterar um gateway
router.put('/alterar-gateway/:id', async (req, res) => {
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
    await Gateway.update({
      bussines_name,
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
      email_responsable
    }, { where: { id } });
    res.json({ mensagem: 'Gateway atualizado com sucesso!' });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Rota para excluir um gateway
router.delete('/excluir-gateway/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Gateway.destroy({ where: { id } });
    res.json({ mensagem: 'Gateway excluído com sucesso!' });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
