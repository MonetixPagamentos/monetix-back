const express = require('express');
const { v4: uuidv4 } = require('uuid'); // Importando a função v4 do uuid
const Gateway = require('../db/models/gateway'); // Importa o modelo Cliente
const TaxaGateway = require('../db/models/taxaGateway');
const Token = require('../db/models/tokens');

const router = express.Router();

// Rota para criar um novo cliente
router.post('/cadastro1/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      gateway_name,
      owner,
      document_gateway,
      business_opening_date,
      statement_descriptor,
      middle_ticket
    } = req.body;

    const token_id = uuidv4(); // Gerando um UUID

    const gateway = await Gateway.create({
      gateway_name,
      owner,
      document_gateway,
      business_opening_date,
      statement_descriptor,
      middle_ticket,
      user_id: userId,
      token_id,
    });

    if (gateway && gateway.id) {

      await Token.create({
        token: token_id,
        id_gateway: gateway.id
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

// dados do responsavel
router.post('/cadastro2', async (req, res) => {
  const {
    gateway_id,
    name_responsable,
    document_responsable,
    phone_responsable,
    email_responsable,
    birth_date,
    mother_name
  } = req.body;


  try {
    const updated = await Gateway.update(
      {
        name_responsable: name_responsable,
        document_responsable: document_responsable,
        phone_responsable: phone_responsable,
        email_responsable: email_responsable,
        birth_date: birth_date,
        mother_name: mother_name,
        sing_up_step: 2

      },
      {
        where: { id: gateway_id }
      }
    );

    if (updated) {
      console.log('Update realizado com sucesso!');
      res.status(200).json({ gateway_id: gateway_id });
    } else {
      console.log('Nenhum registro foi atualizado.');
    }
  } catch (error) {
    console.error('Erro ao realizar o update:', error);
    res.status(500).send(error);
  }
});

// dados de endereço
router.post('/cadastro3', async (req, res) => {
  const {
    gateway_id,
    zip_code,
    street,
    number,
    city,
    state,
    district,
    country
  } = req.body;

  try {
    const updated = await Gateway.update(
      {
        zip_code: zip_code,
        street: street,
        number: number,
        city: city,
        state: state,
        district: district,
        country: country,
        sing_up_step: 3
      },
      {
        where: { id: gateway_id }
      }
    );

    if (updated) {
      console.log('Update realizado com sucesso!');
      res.status(200).json({ gateway_id: gateway_id });
    } else {
      console.log('Nenhum registro foi atualizado.');
    }
  } catch (error) {
    console.error('Erro ao realizar o update:', error);
    res.status(500).send(error);
  }
});

// dados bancarios
router.post('/cadastro4', async (req, res) => {
  const {
    gateway_id,
    bank,
    agency,
    account,
    type_account
  } = req.body;

  try {
    const updated = await Gateway.update(
      {
        bank: bank,
        agency: agency,
        account: account,
        type_account: type_account,
        sing_up_step: 4
      },
      {
        where: { id: gateway_id }
      }
    );

    if (updated) {
      console.log('Update realizado com sucesso!');
      res.status(200).json({ gateway_id: gateway_id });
    } else {
      console.log('Nenhum registro foi atualizado.');
    }
  } catch (error) {
    console.error('Erro ao realizar o update:', error);
    res.status(500).send(error);
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
