const express = require('express');
const { Sequelize } = require('sequelize');
const Transactions = require('../db/models/transactions');
const Token = require('../db/models/tokens');
const TransactionItem = require('../db/models/transactionItem');
const SaldoGateway = require('../db/models/saldoGateway');
const TaxaGateway = require('../db/models/taxaGateway');
const { v4: uuidv4 } = require('uuid');
const SubContaSeller = require('../db/models/subContaSeller');
const sequelize = require('../db/connection');
const IACortex = require('../db/models/IACortex');
require('dotenv').config();
const router = express.Router();


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
 *               - txid 
 *               - amount
 *               - cardNumber
 *               - cvv
 *               - description
 *               - expirationDate
 *               - idOriginTransaction
 *               - name
 *               - numbersInstallments
 *               - typePayment
 *               - payment_method
 *               - id_gateway
 *               - postback_gateway
 *               - id_seller
 *               - link_origem
 *               - city
 *               - uf
 *               - country
 *               - email
 *               - document,
 *               - phone
 *             properties:
 *               txid:
 *                 type: string
 *                 example: "*Uuid*" 
 *                 description: Uuid para identificação da transação e retorno em postback
 *               amount:
 *                 type: number
 *                 example: 20001
 *                 description: O valor da transação em centavos.
 *               cardNumber:
 *                 type: string
 *                 example: "4444444444444444"
 *                 description: O número do cartão de crédito.
 *               cvv:
 *                 type: string
 *                 example: "444"
 *                 description: O código de segurança do cartão.
 *               description:
 *                 type: string
 *                 example: "Venda de tênis"
 *                 description: Uma descrição da transação.
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 example: "205012"
 *                 description: A data de expiração do cartão (YYYYMM).
 *               idOriginTransaction:
 *                 type: string
 *                 example: "12345678"
 *                 description: ID da transação de origem (Uuid).
 *               name:
 *                 type: string
 *                 example: "João da Silva"
 *                 description: Nome no cartão de crédito ou do comprador (em caso de pix).
 *               document:
 *                 type: string
 *                 example: "99999999999"
 *                 description: CPF ou CNPJ do comprador.
 *               numbersInstallments:
 *                 type: integer
 *                 example: 1
 *                 description: Número de parcelas para cartão de crédito.
 *               typePayment:
 *                 type: string
 *                 example: "A_VISTA"
 *                 description: Tipo de pagamento (A_VISTA ou PARCELADO).
 *               payment_method:
 *                 type: string
 *                 example: "PIX"
 *                 description: Método de pagamento utilizado (PIX ou CARD).
 *               postback_url:
 *                 type: string
 *                 example: "https://meusite.com/webhook"
 *                 description: URL de postback do gateway.
 *               id_seller:
 *                 type: integer
 *                 example: 1
 *                 description: ID da subconta do vendedor.
 *               link_origem:
 *                 type: string
 *                 example: "https://sitevenda.com.br"
 *                 description: Link da origem do site da venda.
 *               city:
 *                 type: string
 *                 example: "São Paulo"
 *                 description: Cidade do comprador.
 *               uf:
 *                 type: string
 *                 example: "SP"
 *                 description: Estado do comprador.
 *               country:
 *                 type: string
 *                 example: "BR"
 *                 description: País do comprador.
 *               email:
 *                 type: string
 *                 example: "exemplo@exemplo.com"
 *                 description: E-mail do comprador.
 *               phone:
 *                 type: string
 *                 example: "+5511991144566"
 *                 description: Telefone do comprador do comprador. 
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
 *                       example: "Tênis"
 *                       description: Descrição do item da venda.
 *                     item_amount:
 *                       type: integer
 *                       example: 20000
 *                       description: Valor da venda em centavos.
 *                     item_qtde:
 *                       type: integer
 *                       example: 1
 *                       description: Quantidade de itens da venda.
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
 *                 name:
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
 *                 postback_url:
 *                   type: string
 *                   description: URL de postback do gateway.
 *       401:
 *         description: Token de autenticação ausente ou inválido.
 *       403:
 *         description: Autorização falhou.
 *       500:
 *         description: Erro ao criar transação.
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.post('/create-transaction', async (req, res) => {

  try {
    const {
      id_seller,
      end_to_end, //por na doc
      external_id, //por na doc
      payment_method,
      link_origem,
      name,
      expirationDate,
      cvv,
      amount,
      numbersInstallments, //por na doc 1 a 12
      idOriginTransaction,
      description,
      cardNumber,
      typePayment,
      email,
      city,
      uf,
      country,
      document,
      phone,

      txid, //por na doc - se for pix
      postback_url, //por na doc - se for pix
      // fim pix

      itens

    } = req.body;

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Token de autenticação ausente ou inválido" });
    }

    const tokenBearer = authHeader.split(' ')[1];

    const tokenRecord = await Token.findOne({ where: { token: tokenBearer, ativo: 1 } });

    if (!tokenRecord)
      return res.status(403).json({ message: "Token inexistente ou intativo!" });


    const subconta = await SubContaSeller.findOne({ where: { id: id_seller, id_gateway: tokenRecord.id_gateway } });

    if (!subconta)
      return res.status(403).json({ message: "Sub Conta inexistente!" });

    if (!txid)
      return res.status(403).json({ message: "Falha na operação txid inexistente!" });

    const trans = await Transactions.findOne({ where: { txid: txid } });

    if (trans)
      return res.status(403).json({ message: "Falha na operação, txid já utilizado, tente novamente com outra referência txid!" });

    var data;
    var transaction;
    if (payment_method === 'CARD') {
      const cardData = {
        nameCreditCard: name,
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
        name: data.nameCreditCard,
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
        postback_url,
        email,
        city,
        uf,
        country,
        txid,
        integridade: 0,
        phone,
        document
      });

    } else if (payment_method === 'PIX') {
      console.log('metodo de pagamento -> ' + payment_method);
      var isCPF = document.length == 11;
      var documentCPF;
      var documentCNPJ;

      if (isCPF) {
        documentCPF = document;
      } else {
        documentCNPJ = document;
      }

      var amount_origin = amount;
      var amount_pix_data = (amount / 100).toFixed(2);

      const pixData = {
        expiration: 600,
        debtor: {
          legalPersonIdentification: documentCNPJ,
          naturalPersonIdentification: documentCPF,
          name
        },
        amount: amount_pix_data,
        description,
        userReference: txid,
        validateDebtor: false
      }

      var uuiD = uuidv4();
      data = await makePixPayment(await getTokenAstraPay(), uuiD, pixData);

      if (!data) return res.status(400).json({ error: "Falha no pagamento PIX" });
      console.log(amount_origin);
      transaction = await Transactions.create({
        amount,
        description,
        idOriginTransaction,
        payment_method,
        token_gateway: tokenRecord.token,
        id_gateway: tokenRecord.id_gateway,
        id_seller,
        external_id,
        end_to_end: uuiD,
        txid,
        link_origem,
        postback_url,
        status: "PENDING",
        name,
        integridade: 100,
        phone,
        document
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
      const refreshSaldo = await refreshSaldoGateway(tokenRecord.id_gateway, id_seller, data.amount, data.numbersInstallments);
      if (refreshSaldo) {
        updateBalance(transaction.id);
      }
    }

    if (payment_method === 'CARD') {     
      setImmediate(() => setIntegridade());
    }

    res.status(201).json(data);

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
 *     security:
 *       - BearerAuth: []
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
 *                 name:
 *                   type: string
 *                   description: Nome no cartão de crédito ou do comprador (em caso de pix)
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
 *                   name:
 *                     type: string
 *                     description: Nome no cartão de crédito ou do comprador (em caso de pix)
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

async function refreshSaldoGateway(id_gateway, id_seller, valor, numbersInstallments) {
  try {

    const taxaGateway = await TaxaGateway.findOne({ where: { id_gateway: id_gateway } });

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
        where: { id_gateway: id_gateway, id_seller: id_seller }
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
    const response = await fetch(process.env.URL_ASTRAPAY + 'charge/v1/charges/instant', {
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
      console.log('makePixPayment ok...');
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

async function setIntegridade(){

  const avaliar = await Transactions.findAll({where:{integridade:0}});

    await avaliar.forEach((a) => {
      console.log('Avaliando as transações pendentes, ID => ' + a.id);
      avaliableCortex(a.id, a.id_seller);
    });
}

async function avaliableCortex(idTransaction, idSeller) {
  try {
    console.log('ID => ' + idTransaction);
    const transactionCortex = await sequelize.query(
      `
        SELECT 
          t.name as nome, 
          t.email,
          t.city as cidade,
          t.uf as estado,
          t.phone as telefone,
          t.amount as valorTotal,
          t.document,
          (SELECT GROUP_CONCAT(ti.description SEPARATOR ',') 
           FROM transaction_items ti 
           WHERE ti.id_transaction = t.id) AS produtos
        FROM transactions t
        WHERE t.id = :idTransaction;
      `,
      {
        replacements: { idTransaction },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!transactionCortex || transactionCortex.length === 0) {
      return false;
    }

    const response = await fetch(`${process.env.URL_API_CORTEX}/integridade/avaliar-transacao`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionCortex[0]), 
    });

    const data = await response.json();
    var txtJustificativa ='';

    await data.resposta.justificativa.forEach((j) => {
      if(txtJustificativa ===''){
        txtJustificativa = j.requisito + ' => ' +j.justificativa;
      }else{
        txtJustificativa = txtJustificativa +' x ' +j.requisito + ' => ' +j.justificativa;      
      }
    });

    await IACortex.create({
      id_transaction: idTransaction,
      integridade: data.resposta.integridade,
      justificativa: txtJustificativa
    });

    await Transactions.update({integridade: data.resposta.integridade},
      {where:{
        id: idTransaction
      }});
   
    if (!response.ok) {    
      console.log('Nao avalidou os produtos');
    }    

    const media = await sequelize.query(
      `
        SELECT 
        CAST((tab.integridade / tab.total_vendas) AS SIGNED) AS media_integridade,
        tab.total_vendas,
        tab.qtde_critica
      FROM (
        SELECT  
          SUM(t.integridade) AS integridade, 
          (SELECT COUNT(*) 
          FROM transactions t2  
          WHERE t2.id_seller = :idSeller  
            AND t2.payment_method <> 'PIX') AS total_vendas,
          (SELECT COUNT(*) 
          FROM transactions t3 
          WHERE t3.integridade < 45
            AND t3.id_seller = :idSeller
            AND t3.payment_method <> 'PIX' ) AS qtde_critica
        FROM transactions t
        WHERE t.id_seller = :idSeller
          AND t.payment_method <> 'PIX'
      ) tab
      `,
      {
        replacements: { idSeller },
        type: sequelize.QueryTypes.SELECT,
      }
    );
   
    if((media[0].total_vendas > 50 && media[0].media_integridade < 48) || media[0].qtde_critica >= 100){
      await SubContaSeller.update({integridade: media[0].media_integridade, status: 0},{where:{id:idSeller}});
    }else{
      await SubContaSeller.update({integridade: media[0].media_integridade},{where:{id:idSeller}});
    }      

    return true;
  } catch (error) {
    console.log(`Error in avaliableCortex: ${error.message}`, error);     
  }
}

module.exports = router;