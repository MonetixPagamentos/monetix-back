const express = require('express');
const router = express.Router();
const SubContaSeller = require('../db/models/subContaSeller');
const Token = require('../db/models/tokens');
const SaldoGateway = require('../db/models/saldoGateway');
const Gateway = require('../db/models/gateway'); // Importa o modelo Cliente

/**
 * @swagger
 * /seller/create-subconta:
 *   post:
 *     summary: Cria uma nova subconta de vendedor
 *     description: Cria uma nova subconta para um vendedor com os dados fornecidos. Requer um token de autenticação Bearer.
 *     tags:
 *       - Subcontas
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome_fantasia
 *               - razao_social
 *               - cnpj
 *               - telefone
 *               - email
 *               - ticket_medio
 *               - numero
 *               - complemento
 *               - rua
 *               - bairro
 *               - cidade
 *               - estado
 *               - pais
 *               - cpf
 *               - nome_mae
 *               - data_nascimento
 *               - postbackUrl
 *               - status
 *               - motivo_status
 *             properties:
 *               nome_fantasia:
 *                 type: string
 *                 example: "Loja Exemplo"
 *               razao_social:
 *                 type: string
 *                 example: "Loja Exemplo LTDA"
 *               cnpj:
 *                 type: string
 *                 example: "12345678000199"
 *               telefone:
 *                 type: string
 *                 example: "(11) 91234-5678"
 *               email:
 *                 type: string
 *                 example: "contato@lojaexemplo.com"
 *               ticket_medio:
 *                 type: number
 *                 example: 5000
 *               numero:
 *                 type: string
 *                 example: "123"
 *               complemento:
 *                 type: string
 *                 example: "Sala 4"
 *               rua:
 *                 type: string
 *                 example: "Rua Exemplo"
 *               bairro:
 *                 type: string
 *                 example: "Centro"
 *               cidade:
 *                 type: string
 *                 example: "São Paulo"
 *               estado:
 *                 type: string
 *                 example: "SP"
 *               pais:
 *                 type: string
 *                 example: "Brasil"
 *               cpf:
 *                 type: string
 *                 example: "12345678900"
 *               nome_mae:
 *                 type: string
 *                 example: "Maria Exemplo"
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               postbackUrl:
 *                 type: string
 *                 example: "https://meusite.com/webhook"
 *     responses:
 *       201:
 *         description: Subconta Seller criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subconta criada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     id_seller:
 *                       type: integer
 *                       example: 456
 *                     id_gateway:
 *                       type: integer
 *                       example: 789
 *                     nome_fantasia:
 *                       type: string
 *                       example: "Loja Exemplo"
 *                     razao_social:
 *                       type: string
 *                       example: "Loja Exemplo LTDA"
 *                     cnpj:
 *                       type: string
 *                       example: "12345678000199"
 *                     telefone:
 *                       type: string
 *                       example: "(11) 91234-5678"
 *                     email:
 *                       type: string
 *                       example: "contato@lojaexemplo.com"
 *                     ticket_medio:
 *                       type: number
 *                       example: 500.50
 *                     numero:
 *                       type: string
 *                       example: "123"
 *                     complemento:
 *                       type: string
 *                       example: "Sala 4"
 *                     rua:
 *                       type: string
 *                       example: "Rua Exemplo"
 *                     bairro:
 *                       type: string
 *                       example: "Centro"
 *                     cidade:
 *                       type: string
 *                       example: "São Paulo"
 *                     estado:
 *                       type: string
 *                       example: "SP"
 *                     pais:
 *                       type: string
 *                       example: "Brasil"
 *                     cpf:
 *                       type: string
 *                       example: "12345678900"
 *                     nome_mae:
 *                       type: string
 *                       example: "Maria Exemplo"
 *                     data_nascimento:
 *                       type: string
 *                       format: date
 *                       example: "1990-01-01"
 *                     postbackUrl:
 *                       type: string
 *                       example: "https://meusite.com/webhook"
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Autorização falhou!
 *       500:
 *         description: Falha ao criar subconta seller
 */


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.post('/create-subconta', async (req, res) => {
    const {
        id_seller, nome_fantasia, razao_social, cnpj, telefone,
        email, ticket_medio, numero, complemento, rua, bairro, cidade, estado, pais, cpf,
        nome_mae, data_nascimento, postbackUrl
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

    const id_gateway = tokenRecord.id_gateway;

    try {        
        const newSubcontaSeller = await SubContaSeller.create({
            id_seller,
            id_gateway,                         
            nome_fantasia,
            razao_social,
            cnpj,
            telefone,
            email,
            ticket_medio,
            numero,
            complemento,
            rua,
            bairro,
            cidade,
            estado,
            pais,
            cpf,
            nome_mae,
            data_nascimento,
            postbackUrl,
            status: 0,
            motivo_status: 'Aguardando liberação'           
        });        

        const gateway = await Gateway.findOne({ where: { id: newSubcontaSeller.id_gateway } });

        await SaldoGateway.create({
            val_disponivel: 0,
            val_reserva: 0,
            id_seller: newSubcontaSeller.id,
            id_gateway: gateway.id,
            id_usuario: gateway.user_id
        });

        res.status(201).json({ message: 'Subconta Seller created successfully', data: newSubcontaSeller });
    } catch (error) {
        console.error('Error creating subconta seller:', error);
        res.status(500).json({ message: 'Failed to create subconta seller', error });
    }
});

router.post('/update-subconta', async (req, res) => {
    const { id_subconta, status } = req.body;

    try {
        const [rows] = await SubContaSeller.update(
            { status: status },
            { where: { id: id_subconta } }
        );

        if (rows > 0) {
            return res.status(200).json({ message: "Subconta status updated successfully" });
        } else {
            return res.status(404).json({ message: "Subconta not found or no update was made" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message || "Failed to update subconta status" });
    }
});

module.exports = router;