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
const { getTokenSSGBank, atualizaTranzacao, getTokenSSGBankCard } = require('../components/functions');
const ProcessamentoCortex = require('../db/models/processamento_cortex');
const PreCharge = require('../db/models/pre_charge');
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
 *               - payerDocument
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
 *               - phone
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
 *               payerDocument:
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
 *                 document:
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
 *                   description: ( 0-RECUSADO, 1-PAGO, 2-ESTORNADO, 3-CHARGEBACK) 
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

    const refID = await Transactions.findOne({ where: { external_id: referenceId } });

    if (refID)
      return res.status(403).json({ message: "referenceId já utilizado!" });


    const subconta = await SubContaSeller.findOne({ where: { id_seller: id_seller, id_gateway: tokenRecord.id_gateway } });

    if (!subconta)
      return res.status(403).json({ message: "Sub Conta inexistente!" });

    var data;
    var transaction;

    let tokenSSGB;
    let token;
    if (paymentWay === 5) {  //CARD

      tokenSSGB = await getTokenSSGBankCard();
      token = 'Bearer ' + tokenSSGB;
      console.log('entrou')

      const expMonth = ecommerce.card.expMonth.toString().padStart(2, '0');
      const expirationDate = '20' + ecommerce.card.expYear + '-' + expMonth;

      const payload = {
        type: "CREDIT",
        amount: Number((Number(amount) / 100)).toFixed(2),
        card_number: ecommerce.card.number,
        card_security_code: ecommerce.card.cvv,
        card_expiration_date: expirationDate,
        card_holder_name: name,
        installments: '' + ecommerce.installments /* pra mandar string*/
      }

      const response = await fetch(`${process.env.URL_API_TOKEN_CARD_SSGB}api/sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(payload)
      });

      data = await response.json();
      let statusError;
      console.log(data);
      if (data.message) {
         statusError = data.message;
        if (statusError.includes('51')) {
          console.log('saldo insuficiente');
        } else if (statusError.includes('14')) {
          console.log('Cartão de credito invalido');
        } else if (statusError.includes('46')) {
          console.log('Data incorreta ou cvv incorreto');
        }else if (statusError.includes('54')) {
          console.log('Cartão Expirado');
        }else if (statusError.includes('03')) {
          console.log('Invalid merchant');
        }        
      }

      if (response.ok) {

        payment_method = 'CARD';

        if (data.status === 'PAID' || data.status === 'ACCEPTED') {
          status = 'PAID'
        } else {
          status = 'ERRO'
        }

        if (ecommerce.installments > 1) {
          typePayment = 'PARCELADO'
        } else {
          typePayment = 'A_VISTA'
        }

        var numbersInstallments;
        if (ecommerce.installments) {
          numbersInstallments = ecommerce.installments;
        }

        transaction = await Transactions.create({
          amount: amount,
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

      } else {

        if (response.status === 401) {
          return res.status(401).json({ message: data.message })
        }

        if (ecommerce.installments > 1) {
          typePayment = 'PARCELADO'
        } else {
          typePayment = 'A_VISTA'
        }       

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
          document: payerDocument,
          msg_erro: statusError
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

        return res.status(403).json({ Status: 2, message: data.message, errors: data.errors });
      }

    } else if (paymentWay === 3)/*PIX*/ {

      tokenSSGB = await getTokenSSGBank();
      token = 'Bearer ' + tokenSSGB;
      const payload = {
        value: Number((Number(amount) / 100)).toFixed(2),
        device_code: process.env.DEVICE_CODE_SSGB
      }
      const response = await fetch(`${process.env.URL_API_TOKEN_SSGB}api/qrcode/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(payload)
      });
      data = await response.json();

      if (!data) return res.status(400).json({ error: "Falha no pagamento PIX" });

      transaction = await Transactions.create({
        amount,
        description,
        idOriginTransaction: data.id,
        payment_method: 'PIX',
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

    if (paymentWay === 5) {
      let statusRetorno = data.status === 'PAID' ? 1 : data.status === 'ESTORNED' ? 2 : data.status === 'CHARGEBACK' ? 3 : 0;

      const retorno = {
        id: transaction.idOriginTransaction,
        register: transaction.updatedAt,
        id_seller: transaction.id_seller,
        buyerId: null,
        payerName: null,
        payerDocument: transaction.document,
        paymentWay: paymentWay,
        description: description,
        amount: amount,
        referenceId: referenceId,
        status: statusRetorno,
        error: null,
        frequency: null,
        callbackUrl: null,
        barcode: null,
        pixCharge: null,
        ted: null,
        link: null,
        ecommerce: {
          installments: ecommerce.installments,
          card: null,
          error: null,
          success: true
        },
        splits: null,
        dueDate: null,
        discount: null,
        fine: null,
        interest: null
      }

      res.status(201).json(retorno);
    } else {
      res.status(201).json(data);
    }

    console.log('PASSOU');

    if (paymentWay === 3) {
      let verificador = true;
      const tempoLimite = 20 * 60 * 1000; // 15 minutos em milissegundos
      const intervalo = 3000; // 3 segundos

      const iniciarVerificacao = async () => {
        const startTime = Date.now();

        console.log('VERIFICANDO STATUS');

        const intervalId = setInterval(async () => {
          if (!verificador || Date.now() - startTime >= tempoLimite) {
            clearInterval(intervalId);
            return;
          }

          try {
            const response = await fetch(`${process.env.URL_API_TOKEN_SSGB}api/qrcode/${data.id}/status?device_code=${process.env.DEVICE_CODE_SSGB}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token
              }
            });

            const retorno = await response.json();

            console.log('STATUS PIX - ' + retorno.status);
            if (retorno.status === 'PAID') {
              verificador = false;
              clearInterval(intervalId);

              const reqBody = {
                success: true,
                message: "Transação paga",
                data: {
                  id: data.id,
                  sellerId: transaction.id_seller,
                  payerDocument: payerDocument,
                  paymentWay: paymentWay,
                  description: description,
                  amount: amount,
                  referenceId: referenceId,
                  status: 0
                }
              }

              atualizaTranzacao(data.id, retorno.status, reqBody);
            } else if (retorno.status != 'PENDING') {
              verificador = false;
              clearInterval(intervalId);

            }
          } catch (error) {
            console.error("Erro ao verificar status:", error);
          }
        }, intervalo);
      };

      iniciarVerificacao();
    }

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
 *                   referenceId:
 *                     type: string
 *                     description: ID da transação.
 *                   amount:
 *                     type: number
 *                     description: Valor da transação. *                  
 *                   description:
 *                     type: string
 *                     description: Uma descrição da transação.
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
 *                   createAt:
 *                     type: date
 *                     description: data de criação
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
        external_id: id_origin_transaction,
      },
    });

    if (!transactions) {
      return res.status(404).json({ message: 'Nenhuma transação encontrada' });
    }

    const retorno = {
      referenceId: transactions.external_id,
      amount: transactions.amount,
      description: transactions.description,
      idOriginTransaction: transactions.idOriginTransaction,
      name: transactions.name,
      numbersInstallments: transactions.installments,
      typePayment: transactions.typePayment,
      payment_method: transactions.payment_method,
      token_gateway: transactions.token_gateway,
      createAt: transactions.createAt
    }

    return res.status(200).json(retorno);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

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

/**
 * @swagger
 * /transactions/transaction-cancel/{referenceId}:
 *   put:
 *     summary: Cancela uma transação
 *     description: Este endpoint permite cancelar uma transação específica utilizando o ID da transação, Requer um token de autenticação Bearer.
 *     tags:
 *       - Transaction
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: referenceId
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

router.put('/transaction-cancel/:referenceId', async (req, res) => {
  const referenceId = req.params.referenceId;

  if (!referenceId) {
    return res.status(400).json({ error: 'id_transaction is required' });
  }

  const transaction = await Transactions.findOne({ where: { external_id: referenceId } });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
   }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Token de autenticação ausente ou inválido" });
  }

  const tokenBearer = authHeader.split(' ')[1];

  const tokenRecord = await Token.findOne({ where: { token: tokenBearer, ativo: 1 } });

  if (!tokenRecord) {
    return res.status(403).json({ message: "Token inexistente ou inativo!" });
  }

  const tokenSSGB = await getTokenSSGBankCard();
  const token = 'Bearer ' + tokenSSGB;
  const body = { email: transaction.email };
  const url = `${process.env.URL_API_TOKEN_CARD_SSGB}api/sale/refund/${transaction.idOriginTransaction}`;
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // Verifica se a resposta indica que a venda foi reembolsada ou cancelada
    if (
      data.status === "REFUNDED" ||
      data.status === "CANCELLED" ||
      (data.message && /REFUNDED|CANCELLED/.test(data.message))
    ) {
      await Transactions.update(
        { status: "CANCELED" },
        { where: { external_id: referenceId } }
      );

      if (transaction.updateBalance === 1) {
        await SaldoGateway.update(
          {
            val_disponivel: Sequelize.literal(`val_disponivel - ${transaction.amount}`)
          },
          {
            where: { id_gateway: transaction.id_gateway, id_seller: transaction.id_seller }
          }
        );
      }

      const retorno = {
        referenceId: transaction.external_id,
        status: 2
      }

      return res.status(200).json(retorno);
    } else {
      return res.status(403).json({ message: 'Falha ao cancelar a transação!' });
    }

  } catch (err) {
    console.error('Error cancelling transaction:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;