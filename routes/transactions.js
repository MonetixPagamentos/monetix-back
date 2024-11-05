const express = require('express');
const Transactions = require('../db/models/transactions');
const Token = require('../db/models/tokens');
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
      end_to_end
    } = req.body;

    // Extrai o token do cabeçalho de autorização
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Token de autenticação ausente ou inválido" });
    }

    const tokenBearer = authHeader.split(' ')[1];
  
    // Busca o token ativo na tabela de Token
    const tokenRecord = await Token.findOne({ where: { token: tokenBearer, ativo: 1 } });

    if (!tokenRecord) {
      return res.status(403).json({ message: "Autorização falhou!" });
    }
    
    fetch(process.env.URL_ROTA_ASTRAPAY_HOMOLOG, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer SEU_TOKEN_AQUI' // Insira seu token de autorização aqui
        },
        body: req.body
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao criar transação: ' + response.statusText);
        }

        const transaction = Transactions.create({
          amount: response.amount,
          cardNumber: response.cardNumber,
          cvv: response.cvv,
          description: response.description,
          expirationDate: response.expirationDate,
          idOriginTransaction: response.idOriginTransaction ,
          nameCreditCard: response.nameCreditCard,
          numbersInstallments: response.numbersInstallments,
          typePayment: response.typePayment,
          payment_method: response. payment_method,
          token_gateway: tokenRecord.token,
          id_gateway: tokenRecord.id_gateway,          
          id_seller,
          external_id,
          authorizationCode,
          creditCardId,
          identificationTransaction,
          identificationTransactionCanceled,
          status,
          end_to_end
        });
    
        res.status(201).json(transaction);
        
    })
    .then(data => {
        console.log('Transação criada com sucesso:', data);
    })
    .catch(error => {
        console.error('Erro:', error);
    });

 
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
      const transactions = await Transactions.findAll({where: {id_gateway: id_gateway}});

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

module.exports = router;