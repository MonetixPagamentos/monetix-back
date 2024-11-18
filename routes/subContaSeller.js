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
 *               nome_fantasia:
 *                 type: string
 *               razao_social:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               telefone:
 *                 type: string
 *               email:
 *                 type: string
 *               ticket_medio:
 *                 type: number
 *               numero:
 *                 type: string
 *               complemento:
 *                 type: string
 *               rua:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               pais:
 *                 type: string
 *               cpf:
 *                 type: string
 *               nome_mae:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               postbackUrl:
 *                 type: string
 *               status:
 *                 type: string
 *               motivo_status:
 *                 type: string
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     id_seller:
 *                       type: integer
 *                     id_gateway:
 *                       type: integer
 *                     nome_fantasia:
 *                       type: string
 *                     razao_social:
 *                       type: string
 *                     cnpj:
 *                       type: string
 *                     telefone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     ticket_medio:
 *                       type: number
 *                     numero:
 *                       type: string
 *                     complemento:
 *                       type: string
 *                     rua:
 *                       type: string
 *                     bairro:
 *                       type: string
 *                     cidade:
 *                       type: string
 *                     estado:
 *                       type: string
 *                     pais:
 *                       type: string
 *                     cpf:
 *                       type: string
 *                     nome_mae:
 *                       type: string
 *                     data_nascimento:
 *                       type: string
 *                       format: date
 *                     postbackUrl:
 *                       type: string
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