const express = require('express');
const { Sequelize } = require('sequelize');
const Transactions = require('../db/models/transactions');
const Token = require('../db/models/tokens');
const TransactionItem = require('../db/models/transactionItem');
const SaldoGateway = require('../db/models/saldoGateway');
const TaxaGateway = require('../db/models/taxaGateway');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const router = express.Router();
const enviarEmail = require('../components/email');

//documentacao
/**
 * @swagger
 * /transactions/create-transaction:
 *   post:
 *     summary: Cria uma nova transação
 *     description: Este endpoint permite a criação de uma nova transação com os detalhes fornecidos. Requer um token de autorização Bearer.
 *     tags:
 *       - Transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - cardNumber
 *               - cvv
 *               - description
 *               - expirationDate
 *               - idOriginTransaction
 *               - nameCreditCard
 *               - numbersInstallments
 *               - typePayment
 *               - payment_method
 *               - id_gateway
 *               - postback_gateway
 *               - id_seller
 *               - link_origem                
 *             properties:
 *               amount:
 *                 type: number
 *                 description: O valor da transação.
 *               cardNumber:
 *                 type: string
 *                 description: O número do cartão de crédito.
 *               cvv:
 *                 type: string
 *                 description: O código de segurança do cartão.
 *               description:
 *                 type: string
 *                 description: Uma descrição da transação.
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 description: A data de expiração do cartão.
 *               idOriginTransaction:
 *                 type: string
 *                 description: ID da transação de origem.
 *               nameCreditCard:
 *                 type: string
 *                 description: Nome no cartão de crédito.
 *               numbersInstallments:
 *                 type: integer
 *                 description: Número de parcelas.
 *               typePayment:
 *                 type: string
 *                 description: Tipo de pagamento.
 *               payment_method:
 *                 type: string
 *                 description: Método de pagamento utilizado.
 *               id_gateway:
 *                 type: string
 *                 description: ID do gateway de pagamento.
 *               postback_gateway:
 *                 type: string
 *                 description: URL de postback do gateway.
 *               id_seller:
 *                 type: integer
 *                 description: Id do vendedor.  
 *               link_origem:
 *                 type: string
 *                 description: Link da origem da venda.
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_description
 *                     - item_amount
 *                     - item_qtde 
 *                   properties:
 *                     item_description:
 *                       type: string
 *                       description: Descrição da venda.     
 *                     item_amount:
 *                       type: string
 *                       description: Valor da venda.
 *                     item_qtde:
 *                       type: string
 *                       description: Quantidade da venda. 
 *     responses:
 *       201:
 *         description: Transação criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID da transação criada.
 *                 amount:
 *                   type: number
 *                   description: O valor da transação.
 *                 description:
 *                   type: string
 *                   description: Uma descrição da transação.
 *                 expirationDate:
 *                   type: string
 *                   format: date
 *                   description: A data de expiração do cartão.
 *                 idOriginTransaction:
 *                   type: string
 *                   description: ID da transação de origem.
 *                 nameCreditCard:
 *                   type: string
 *                   description: Nome no cartão de crédito.
 *                 numbersInstallments:
 *                   type: integer
 *                   description: Número de parcelas.
 *                 typePayment:
 *                   type: string
 *                   description: Tipo de pagamento.
 *                 payment_method:
 *                   type: string
 *                   description: Método de pagamento.
 *                 id_gateway:
 *                   type: string
 *                   description: ID do gateway.
 *                 postback_gateway:
 *                   type: string
 *                   description: URL de postback do gateway.
 *       401:
 *         description: Token de autenticação ausente ou inválido.
 *       403:
 *         description: Autorização falhou.
 *       500:
 *         description: Erro ao criar transação.
 */

router.post('/create-transaction', async (req, res) => {
  try {
    const {
      id_seller,
      end_to_end,
      external_id,
      payment_method,
      link_origem,
      nameCreditCard,
      expirationDate,
      cvv,
      amount,
      numbersInstallments,
      idOriginTransaction,
      description,
      cardNumber,
      typePayment,

      // pix
      keyPix,
      merchantName,
      merchantCity,
      txid,
      postback_url,
      // fim pix

      itens

    } = req.body;

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Token de autenticação ausente ou inválido" });
    }

    const tokenBearer = authHeader.split(' ')[1];

    const tokenRecord = await Token.findOne({ where: { /*token: tokenBearer,*/ ativo: 1 } });

    if (!tokenRecord) {
      return res.status(403).json({ message: "Autorização falhou!" });
    }

    var data;
    var transaction;
    if (payment_method === 'CARD') {
      const cardData = {
        nameCreditCard,
        expirationDate,
        cvv,
        amount,
        numbersInstallments,
        idOriginTransaction,
        description,
        cardNumber,
        typePayment
      };

      data = await makeCreditPayment(await getTokenAstraPay(), uuidv4(), cardData);

      if (!data) return res.status(400).json({ error: "Falha no pagamento com cartão" });

      transaction = await Transactions.create({
        amount: data.amount,
        cardNumber: data.cardNumber,
        cvv: data.cvv,
        description: data.description,
        expirationDate: data.expirationDate,
        idOriginTransaction: data.idOriginTransaction,
        nameCreditCard: data.nameCreditCard,
        numbersInstallments: data.numbersInstallments,
        typePayment: data.typePayment,
        authorizationCode: data.autorizationCode,
        creditCardId: data.creditCardId,
        identificationTransaction: data.identificationTransaction,
        identificationTransactionCanceled: data.identificationTransactionCanceled,
        status: data.status,
        payment_method,
        token_gateway: tokenRecord.token,
        id_gateway: tokenRecord.id_gateway,
        id_seller,
        external_id,
        end_to_end,
        link_origem,
        postback_url
      });

    } else if (payment_method === 'PIX') {

      const pixData = {
        txid,
        keyPix,
        merchantName,
        merchantCity,
        amount: amount
      }
      
      var uuiD = uuidv4();
      data = await makePixPayment(await getTokenAstraPay(), uuiD, pixData);

      if (!data) return res.status(400).json({ error: "Falha no pagamento PIX" });

      transaction = await Transactions.create({
        amount,
        description,
        idOriginTransaction,
        identificationTransaction: data.identificationTransaction,
        payment_method,
        token_gateway: tokenRecord.token,
        id_gateway: tokenRecord.id_gateway,
        id_seller,
        external_id,
        end_to_end: uuiD,
        link_origem,
        postback_url,
        status: "pending"
      });
    } else {
      return res.status(400).json({ error: "Método de pagamento inválido" });
    }

    await itens.forEach((item) => {
      TransactionItem.create({
        id_transaction: transaction.id,
        id_gateway: tokenRecord.id_gateway,
        description: item.item_description,
        amount: item.item_amount,
        qtde: item.item_qtde
      });
    });

    if (transaction && data.status == "PAID") {
      const refreshSaldo = await refreshSaldoGateway(tokenRecord.id_gateway, data.amount, data.numbersInstallments);
      if (refreshSaldo) {
        updateBalance(transaction.id);
      }
    }

    res.status(201).json(transaction);

  } catch (error) {
    console.error("Erro ao criar transação:", error);
    res.status(500).json({ error: "Erro ao criar transação." });
  }
});

//documentacao
/**
 * @swagger
 * /transactions-gateway:
 *   get:
 *     summary: Obtém transações por ID do gateway
 *     description: Este endpoint permite buscar transações associadas a um gateway específico, fornecendo o ID do gateway como parâmetro de consulta.
 *     tags:
 *       - Transaction
 *     parameters:
 *       - in: query
 *         name: id_gateway
 *         required: true
 *         description: O ID do gateway para buscar as transações.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transações encontradas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID da transação.
 *                 amount:
 *                   type: number
 *                   description: Valor da transação.
 *                 cardNumber:
 *                   type: string
 *                   description: Número do cartão de crédito.
 *                 cvv:
 *                   type: string
 *                   description: Código de segurança do cartão.
 *                 description:
 *                   type: string
 *                   description: Uma descrição da transação.
 *                 expirationDate:
 *                   type: string
 *                   format: date
 *                   description: Data de expiração do cartão.
 *                 idOriginTransaction:
 *                   type: string
 *                   description: ID da transação de origem.
 *                 nameCreditCard:
 *                   type: string
 *                   description: Nome no cartão de crédito.
 *                 numbersInstallments:
 *                   type: integer
 *                   description: Número de parcelas.
 *                 typePayment:
 *                   type: string
 *                   description: Tipo de pagamento.
 *                 payment_method:
 *                   type: string
 *                   description: Método de pagamento.
 *                 token_gateway:
 *                   type: string
 *                   description: Token gerado pelo gateway de pagamento.
 *                 id_gateway:
 *                   type: string
 *                   description: ID do gateway de pagamento.
 *                 postback_gateway:
 *                   type: string
 *                   description: URL de postback do gateway.
 *       400:
 *         description: ID do gateway não fornecido.
 *       404:
 *         description: Nenhuma transação encontrada para o ID fornecido.
 *       500:
 *         description: Erro ao buscar transações.
 */

router.get('/transactions-gateway', async (req, res) => {
  const { id_gateway } = req.query;
  try {
    if (!id_gateway) {
      return res.status(400).json({ error: 'id_gateway é obrigatório' });
    }
    const transactions = await Transactions.findAll({ where: { id_gateway: id_gateway } });

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Nenhuma transação encontrada' });
    }

    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

//documentacao
/**
 * @swagger
 * /transactions-id:
 *   get:
 *     summary: Obtém todas as transações por ID de origem
 *     description: Este endpoint permite buscar todas as transações associadas a um ID de origem específico, fornecendo o ID como parâmetro de consulta.
 *     tags:
 *       - Transaction
 *     parameters:
 *       - in: query
 *         name: id_origin_transaction
 *         required: true
 *         description: O ID da transação
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transação encontradas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID da transação.
 *                   amount:
 *                     type: number
 *                     description: Valor da transação.
 *                   cardNumber:
 *                     type: string
 *                     description: Número do cartão de crédito.
 *                   cvv:
 *                     type: string
 *                     description: Código de segurança do cartão.
 *                   description:
 *                     type: string
 *                     description: Uma descrição da transação.
 *                   expirationDate:
 *                     type: string
 *                     format: date
 *                     description: Data de expiração do cartão.
 *                   idOriginTransaction:
 *                     type: string
 *                     description: ID da transação de origem.
 *                   nameCreditCard:
 *                     type: string
 *                     description: Nome no cartão de crédito.
 *                   numbersInstallments:
 *                     type: integer
 *                     description: Número de parcelas.
 *                   typePayment:
 *                     type: string
 *                     description: Tipo de pagamento.
 *                   payment_method:
 *                     type: string
 *                     description: Método de pagamento.
 *                   token_gateway:
 *                     type: string
 *                     description: Token gerado pelo gateway de pagamento.
 *                   id_gateway:
 *                     type: string
 *                     description: ID do gateway de pagamento.
 *                   postback_gateway:
 *                     type: string
 *                     description: URL de postback do gateway.
 *       400:
 *         description: ID de origem da transação não fornecido.
 *       404:
 *         description: Nenhuma transação encontrada para o ID fornecido.
 *       500:
 *         description: Erro ao buscar transações.
 */
router.get('/transactions-id', async (req, res) => {
  const { id_origin_transaction } = req.query;
  try {
    if (!id_origin_transaction) {
      return res.status(400).json({ error: 'idOriginTransaction é obrigatório' });
    }

    const transactions = await Transactions.findOne({
      where: {
        id_origin_transaction: id_origin_transaction,
      },
    });

    if (!transactions) {
      return res.status(404).json({ message: 'Nenhuma transação encontrada' });
    }

    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

async function getTokenAstraPay() {
  try {
    const response = await fetch(process.env.URL_ASTRAPAY + 'oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      })
    });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Erro ao obter token:', error);
  }
}

async function refreshSaldoGateway(id_gateway, valor, numbersInstallments) {
  try {

    const taxaGateway = await TaxaGateway.findOne({ id_gateway: id_gateway });

    const taxa_reserva = taxaGateway.taxa_reserva;
    const campo = `taxa_cartao_${numbersInstallments}`;
    const taxa = taxaGateway[campo];

    var descTaxCard = (valor * (taxa / 100));
    var valReserve = (valor * (taxa_reserva / 100));

    const valDisponivel = valor - descTaxCard - valReserve - taxaGateway.taxa_transacao;


    await SaldoGateway.update(
      {
        val_disponivel: Sequelize.literal(`val_disponivel + ${valDisponivel}`),
        val_reserva: Sequelize.literal(`val_reserva + ${valReserve}`)
      },
      {
        where: { id_gateway: id_gateway }
      }
    );
    console.log("Campos atualizados com sucesso.");
    return true;
  } catch (error) {
    console.error("Erro ao atualizar os campos:", error);
  }
}

async function makeCreditPayment(tokenAstraPay, transactionId, body) {
  const token = ' Bearer ' + tokenAstraPay
  try {
    const response = await fetch(process.env.URL_ASTRAPAY + 'card/v1/credit', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-transaction-id': transactionId,
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (response.ok) {
      return data;
    }
    return false;
  } catch (error) {
    console.error('Erro ao realizar pagamento:', error.response ? error.response.data : error.message);
    return false;
  }
}

async function makePixPayment(tokenAstraPay, transactionId, body) {
  const token = ' Bearer ' + tokenAstraPay
  try {
    const response = await fetch(process.env.URL_ASTRAPAY + 'charge/v1/cob-static/encode', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-transaction-id': transactionId,
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (response.ok) {
      return data;
    }
    return false;
  } catch (error) {
    console.error('Erro ao realizar pagamento:', error.response ? error.response.data : error.message);
    return false;
  }
}

async function updateBalance(id_transaction) {
  try {
    await Transactions.update(
      { updated_balance: 1 },
      { where: { id: id_transaction } }
    );
    console.log("Campo updated_balance atualizado, id_transaction: " + id_transaction);
  } catch (error) {
    console.error("Erro ao atualizar o campo updated_balance:", error);
  }
}

module.exports = router;