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
const { getTokenInfratec, integraPedidoRastrac } = require('../components/functions');
const ProcessamentoCortex = require('../db/models/processamento_cortex');
require('dotenv').config();
const router = express.Router();


/**
 * @swagger
 * /transactions/create-transaction:
 *   post:
 *     summary: Cria uma nova transação (PIX ou CARTAO)
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
 *               - description
 *               - name
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
 *               - document
 *               - phone
 *               - payerDocument
 *             properties:               
 *               amount:
 *                 type: number
 *                 example: 20001
 *                 description: O valor da transação em centavos.
 *               description:
 *                 type: string
 *                 example: "Venda de tênis"
 *                 description: Uma descrição da transação.
 *               name:
 *                 type: string
 *                 example: "João da Silva"
 *                 description: Nome no cartão de crédito ou do comprador (em caso de pix).
 *               document:
 *                 type: string
 *                 example: "99999999999"
 *                 description: CPF ou CNPJ do comprador.
 *               typePayment:
 *                 type: string
 *                 example: "A_VISTA"
 *                 description: Tipo de pagamento (A_VISTA ou PARCELADO).
 *               payment_method:
 *                 type: string
 *                 example: "PIX"
 *                 description: Método de pagamento utilizado (PIX ou CARD).
 *               postback_gateway:
 *                 type: string
 *                 example: "https://meusite.com/webhook"
 *                 description: URL de postback do gateway.
 *               id_seller:
 *                 type: integer
 *                 example: "token do vendendor"
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
 *                 description: Telefone do comprador. 
 *               payerDocument:
 *                 type: string 
 *                 example: "123456456464"
 *                 description: CPF/CNPJ do comprador. 
 *               paymentWay:
 *                 type: integer 
 *                 example: 3
 *                 description: 3 = PIX, 5 = CARTAO
 *               referenceId:  
 *                 type: string 
 *                 example: "UUID"
 *                 description: ID de referência do gateway.
 *               ecommerce:
 *                 type: object
 *                 required:
 *                   - installments
 *                   - card
 *                 properties:
 *                   installments:
 *                     type: integer
 *                     example: 1
 *                     description: Numero de parcelas.
 *                   card:
 *                     type: object
 *                     required:
 *                       - number
 *                       - expMonth
 *                       - expYear
 *                       - cvv
 *                     properties:
 *                       number:
 *                         type: string
 *                         example: "4111111111111111"
 *                         description: Numero do cartão.
 *                       expMonth:
 *                         type: integer
 *                         example: 12
 *                         description: Mês de expiração do cartão.
 *                       expYear:
 *                         type: integer
 *                         example: 32
 *                         description: Ano de expiração do cartão.
 *                       cvv:
 *                         type: string
 *                         example: "123"
 *                         description: Código de segurança do cartão.
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
 *                   example: "ac4aeb24-6418-46a6-a6b8-1313704c66fb"
 *                   description: ID da transação criada.
 *                 register:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-12T17:17:04.2215772"
 *                   description: Data de registro da transação.
 *                 id_seller:
 *                   type: string
 *                   example: "cb0a3eb9-85b2-43ad-a63b-18cd48122281"
 *                   description: ID do vendedor.
 *                 buyerId:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: ID do comprador.
 *                 payerName:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Nome do pagador.
 *                 payerDocument:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Documento do pagador.
 *                 paymentWay:
 *                   type: integer
 *                   example: 5
 *                   description: Método de pagamento (3 = PIX, 5 = CARTÃO).
 *                 description:
 *                   type: string
 *                   example: "Venda"
 *                   description: Descrição da transação.
 *                 amount:
 *                   type: number
 *                   example: 2000
 *                   description: Valor da transação em centavos.
 *                 referenceId:
 *                   type: string
 *                   example: "3d664d71-247f-496e-8890-ff9297712b35"
 *                   description: ID de referência da transação.
 *                 status:
 *                   type: integer
 *                   example: 1
 *                   description: Status da transação.
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Erro ocorrido, se houver.
 *                 frequency:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Frequência de pagamento, se aplicável.
 *                 callbackUrl:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: URL de callback.
 *                 barcode:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Código de barras, se aplicável.
 *                 pixCharge:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Detalhes do PIX, se aplicável.
 *                 ted:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Detalhes de TED, se aplicável.
 *                 link:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Link de pagamento, se aplicável.
 *                 ecommerce:
 *                   type: object
 *                   properties:
 *                     installments:
 *                       type: integer
 *                       example: 1
 *                       description: Número de parcelas.
 *                     card:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                       description: Detalhes do cartão.
 *                     error:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                       description: Erro no ecommerce, se houver.
 *                     success:
 *                       type: boolean
 *                       example: true
 *                       description: Indicador de sucesso do ecommerce.
 *                 splits:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Detalhes de split, se aplicável.
 *                 dueDate:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Data de vencimento, se aplicável.
 *                 discount:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Detalhes de desconto, se aplicável.
 *                 fine:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Detalhes de multa, se aplicável.
 *                 interest:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                   description: Detalhes de juros, se aplicável.
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
      paymentWay,
      amount,
      referenceId,
      ecommerce,
      link_origem,
      name,
      description,
      email,
      city,
      uf,
      country,
      payerDocument,
      phone,
      callbackUrl,
      end_to_end,
      itens,
      postback_gateway

    } = req.body;

    console.log(req.body);
    console.log('');
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Token de autenticação ausente ou inválido" });
    }

    const tokenBearer = authHeader.split(' ')[1];

    const tokenRecord = await Token.findOne({ where: { token: tokenBearer, ativo: 1 } });

    if (!tokenRecord)
      return res.status(403).json({ message: "Token inexistente ou inatativo!" });


    const subconta = await SubContaSeller.findOne({ where: { id_seller: id_seller, id_gateway: tokenRecord.id_gateway } });

    if (!subconta)
      return res.status(403).json({ message: "Sub Conta inexistente!" });

    var data;
    var transaction;

    const tokenInfratec = await getTokenInfratec();
    const token = 'Bearer ' + tokenInfratec.access_token;
    if (paymentWay === 5) {
      console.log('entrou')
      const bodyx = {
        sellerId: tokenRecord.token,
        amount,
        referenceId,
        paymentWay,
        description,
        ecommerce
      }
      console.log(bodyx);

      const response = await fetch(`${process.env.INFRATEC_API}/api/charges/partners/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'Accept': '*/*',
          'Accept-Encoding': 'gzip,deflate,br',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({
          sellerId: tokenRecord.token,
          amount,
          referenceId,
          paymentWay,
          description,
          ecommerce
        })
      });

      if (response.headers.get('Content-Type')?.includes('application/json')) {
        data = await response.json();
      } else {

        if (ecommerce.installments > 1) {
          typePayment = 'PARCELADO'
        } else {
          typePayment = 'A_VISTA'
        }

        const text = await response.text();

        transaction = await Transactions.create({
          amount: amount,
          cardNumber: ecommerce.card.number,
          cvv: ecommerce.card.cvv,
          description,
          expirationDate: ecommerce.card.expMonth + '/' + ecommerce.card.expYear,
          idOriginTransaction: 0,
          name,
          numbersInstallments: ecommerce.installments,
          typePayment,
          status: 'ERRO',
          payment_method: 'CARD',
          token_gateway: tokenRecord.token,
          id_gateway: tokenRecord.id_gateway,
          id_seller,
          external_id: referenceId,
          end_to_end,
          link_origem,
          postback_url: postback_gateway,
          email,
          city,
          uf,
          country,
          integridade: 5,
          phone,
          document: payerDocument
        });

        await itens.forEach((item) => {
          TransactionItem.create({
            id_transaction: transaction.id,
            id_gateway: tokenRecord.id_gateway,
            description: item.item_description,
            amount: item.item_amount,
            qtde: item.item_qtde
          });
        });

        return res.status(201).json({ Status: 2, text: text });
      }

      if (!data) return res.status(400).json({ error: "Falha no pagamento com cartão" });

      payment_method = 'CARD';

      if (data.status === 0) {
        status = 'CANCELED'
      } else if (data.status === 1) {
        status = 'PAID'
      } else {
        status = 'ERRO'
      }

      if (data.ecommerce.installments > 1) {
        typePayment = 'PARCELADO'
      } else {
        typePayment = 'A_VISTA'
      }

      var numbersInstallments;
      if (data.ecommerce.installments) {
        numbersInstallments = data.ecommerce.installments;
      }

      transaction = await Transactions.create({
        amount: data.amount,
        cardNumber: ecommerce.card.number,
        cvv: ecommerce.card.cvv,
        description,
        expirationDate: ecommerce.card.expMonth + '/' + ecommerce.card.expYear,
        idOriginTransaction: data.id,
        name,
        numbersInstallments,
        typePayment,
        status,
        payment_method,
        token_gateway: tokenRecord.token,
        id_gateway: tokenRecord.id_gateway,
        id_seller,
        external_id: referenceId,
        end_to_end,
        link_origem,
        postback_url: postback_gateway,
        email,
        city,
        uf,
        country,
        integridade: subconta.integridade,
        phone,
        document: payerDocument
      });

      if (transaction && status === 'PAID') {
        const refreshSaldo = await refreshSaldoGateway(tokenRecord.id_gateway, id_seller, amount, numbersInstallments);
        if (refreshSaldo) {
          updateBalance(transaction.id);
        }

        var produtoCortex = '';
        await itens.forEach((item) => {
          if (produtoCortex === '') {
            produtoCortex = item.item_description;
          } else {
            produtoCortex = produtoCortex + ' - ' + item.item_description
          }
        });

        await ProcessamentoCortex.create({
          id_transaction: transaction.id,
          nome: name,
          email: email,
          cidade: city,
          estado: uf,
          telefone: phone,
          produtos: produtoCortex,
          valor_total: transaction.amount,
          document: payerDocument
        });
      }

    } else if (paymentWay === 3)/*PIX*/ {

      const response = await fetch(`${process.env.INFRATEC_API}/api/charges/partners/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'Accept': '*/*',
          'Accept-Encoding': 'gzip,deflate,br',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({
          sellerId: tokenBearer,
          amount,
          referenceId,
          paymentWay,
          description,
          payerDocument,
          callbackUrl: process.env.API_BASE_URL + '/pix/postback-pix-payment'
        })
      });

      if (response.headers.get('Content-Type')?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        return res.status(500).json({ error: "Erro ao criar transação. " + text });
      }

      if (data.paymentWay === 5) {
        payment_method = 'CARD'
      } else if (data.paymentWay === 3) {
        payment_method = 'PIX'
      } else if (data.paymentWay === 2) {
        payment_method = 'BOLETO'
      }

      if (!data) return res.status(400).json({ error: "Falha no pagamento PIX" });

      transaction = await Transactions.create({
        amount,
        description,
        idOriginTransaction: data.id,
        payment_method,
        token_gateway: tokenRecord.token,
        id_gateway: tokenRecord.id_gateway,
        id_seller,
        external_id: referenceId,
        end_to_end,
        link_origem,
        postback_url: postback_gateway,
        status: "PENDING",
        name,
        integridade: subconta.integridade,
        phone,
        document: payerDocument
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
    
    if (status === 'PAID')
      await integraPedidoRastrac(transaction, itens, subconta, tokenRecord.token);

    res.status(201).json(data);

  } catch (error) {
    console.error("Erro ao criar transação:", error);
    res.status(500).json({ error: "Erro ao criar transação." });
  }
});

/**
 * @swagger
 * /transaction-cancel/{id_transaction}:
 *   put:
 *     summary: Cancela uma transação
 *     description: Este endpoint permite cancelar uma transação específica utilizando o ID da transação, Requer um token de autenticação Bearer.
 *     tags:
 *       - Transaction
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_transaction
 *         required: true
 *         description: O ID da transação a ser cancelada.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transação cancelada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica se a operação foi bem-sucedida.
 *                 message:
 *                   type: string
 *                   description: Mensagem de retorno.
 *                 data:
 *                   type: object
 *                   description: Dados adicionais sobre a transação cancelada.
 *       400:
 *         description: ID da transação não fornecido ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Detalhes do erro.
 *       401:
 *         description: Não autorizado - Token inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Token de autenticação ausente ou inválido.
 *       403:
 *         description: Proibido - Token inexistente ou inativo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Detalhes do motivo da proibição.
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Detalhes do erro.
 */

router.put('/transaction-cancel/:id_transaction', async (req, res) => {
  const { id_transaction } = req.params.id_transaction;
  const url = `https://qas.triacom.com.br/api/charges/partners/sales/refund/${id_transaction}`;

  if (!id_transaction) {
    return res.status(400).json({ error: 'id_transaction is required' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Token de autenticação ausente ou inválido" });
  }

  const tokenBearer = authHeader.split(' ')[1];

  const tokenRecord = await Token.findOne({ where: { token: tokenBearer, ativo: 1 } });

  if (!tokenRecord)
    return res.status(403).json({ message: "Token inexistente ou inatativo!" });


  const tokenInfratec = await getTokenInfratec();
  const token = 'Bearer ' + tokenInfratec.access_token;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip,deflate,br',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error cancelling transaction:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



//documentacao
/**
 * @swagger
 * /transactions-gateway:
 *   get:
 *     summary: Obtém transações do gateway. 
 *     description: Este endpoint permite buscar transações associadas a um gateway específico, Requer um token de autenticação Bearer.
 *     tags:
 *       - Transaction
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Transações encontradas com sucesso.
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
 *                     description: Nome no cartão de crédito ou do comprador (em caso de pix).
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
 *       401:
 *         description: Não autorizado - Token inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Token de autenticação ausente ou inválido.
 *       403:
 *         description: Proibido - Token inexistente ou inativo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Detalhes do motivo da proibição.
 *       400:
 *         description: Nenhuma transação encontrada para o ID fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Detalhes sobre a ausência de transações.
 *       500:
 *         description: Erro ao buscar transações.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Detalhes do erro.
 */

router.get('/transactions-gateway', async (req, res) => {
  try {

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Token de autenticação ausente ou inválido" });
    }

    const tokenBearer = authHeader.split(' ')[1];

    const tokenRecord = await Token.findOne({ where: { token: tokenBearer, ativo: 1 } });

    if (!tokenRecord)
      return res.status(403).json({ message: "Token inexistente ou inatativo!" });

    const transactions = await Transactions.findAll({ where: { id_gateway: tokenRecord.id_gateway } });

    if (transactions.length === 0) {
      return res.status(400).json({ message: 'Nenhuma transação encontrada' });
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

async function makeCreditPayment(tokenParceiro, body) {
  const token = 'Bearer ' + tokenParceiro;
  try {
    const response = await fetch(process.env.INFRATEC_API + '/api/chargers/partners/sales', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip,deflate,br',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text(); // Obtenha o texto bruto
    try {
      const data = JSON.parse(responseText); // Tente converter para JSON
      if (response.ok) {
        return data;
      }
      console.error('Erro na API:', data);
      return false;
    } catch (error) {
      console.error('Resposta não é um JSON válido:', responseText);
      return false;
    }
  } catch (error) {
    console.error('Erro ao realizar pagamento:', error.message);
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

async function setIntegridade() {

  const avaliar = await Transactions.findAll({ where: { integridade: 0 } });

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
    var txtJustificativa = '';

    await data.resposta.justificativa.forEach((j) => {
      if (txtJustificativa === '') {
        txtJustificativa = j.requisito + ' => ' + j.justificativa;
      } else {
        txtJustificativa = txtJustificativa + ' x ' + j.requisito + ' => ' + j.justificativa;
      }
    });

    await IACortex.create({
      id_transaction: idTransaction,
      integridade: data.resposta.integridade,
      justificativa: txtJustificativa
    });

    await Transactions.update({ integridade: data.resposta.integridade },
      {
        where: {
          id: idTransaction
        }
      });

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

    if ((media[0].total_vendas > 50 && media[0].media_integridade < 48) || media[0].qtde_critica >= 100) {
      await SubContaSeller.update({ integridade: media[0].media_integridade, status: 0 }, { where: { id: idSeller } });
    } else {
      await SubContaSeller.update({ integridade: media[0].media_integridade }, { where: { id: idSeller } });
    }

    return true;
  } catch (error) {
    console.log(`Error in avaliableCortex: ${error.message}`, error);
  }
}

module.exports = router;