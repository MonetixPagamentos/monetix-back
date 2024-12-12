const express = require('express');
const router = express.Router();
const SubContaSeller = require('../db/models/subContaSeller');
const Token = require('../db/models/tokens');
const SaldoGateway = require('../db/models/saldoGateway');
const Gateway = require('../db/models/gateway'); 
const { v4: uuidv4 } = require('uuid');

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
 *               - name
 *               - document
 *               - cellphone
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
 *               - birthDate
 *               - postbackUrl
 *               - status
 *               - motivo_status
 *               - account
 *             properties:
 *               nome_fantasia:
 *                 type: string
 *                 example: "Loja Exemplo"
 *               name:
 *                 type: string
 *                 example: "Loja Exemplo LTDA"
 *               document:
 *                 type: string
 *                 example: "12345678000199"
 *               cellphone:
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
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               postbackUrl:
 *                 type: string
 *                 example: "https://meusite.com/webhook"
 *               account:
 *                 type: object
 *                 required:
 *                   - Agency
 *                   - Number
 *                   - BankCode
 *                 properties:
 *                   agency:
 *                     type: string
 *                     example: "0001"
 *                   number:
 *                     type: string
 *                     example: "44452675"
 *                   bankCode:
 *                     type: string
 *                     example: "260"
 *                   pixKey:
 *                     type: string
 *                     nullable: true
 *                     example: null
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
 *                   example: "Subconta Seller created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     id_gateway:
 *                       type: integer
 *                       example: 1
 *                     nome_fantasia:
 *                       type: string
 *                       example: "Rogerio Mes"
 *                     razao_social:
 *                       type: string
 *                       example: "Rogerinos"
 *                     cnpj:
 *                       type: string
 *                       example: "43485794000138"
 *                     telefone:
 *                       type: string
 *                       example: "47999950731"
 *                     email:
 *                       type: string
 *                       example: "gianbona15@gmail.com@gmail.com"
 *                     ticket_medio:
 *                       type: number
 *                       example: 50002
 *                     numero:
 *                       type: string
 *                       example: "4001"
 *                     complemento:
 *                       type: string
 *                       example: "casa1"
 *                     rua:
 *                       type: string
 *                       example: "erich jung2 "
 *                     bairro:
 *                       type: string
 *                       example: "benedito3"
 *                     cidade:
 *                       type: string
 *                       example: "INDAIAL1"
 *                     estado:
 *                       type: string
 *                       example: "RS"
 *                     pais:
 *                       type: string
 *                       example: "Brasil"
 *                     cpf:
 *                       type: string
 *                       example: "05642500902"
 *                     nome_mae:
 *                       type: string
 *                       example: "Maria Regina"
 *                     data_nascimento:
 *                       type: string
 *                       format: date-time
 *                       example: "1985-02-01T03:00:00.000Z"
 *                     postbackUrl:
 *                       type: string
 *                       example: "https://testani.com/teste-api"
 *                     status:
 *                       type: integer
 *                       example: 0
 *                     motivo_status:
 *                       type: string
 *                       example: "Aguardando liberação"
 *                     agencia:
 *                       type: string
 *                       example: "0001"
 *                     conta:
 *                       type: string
 *                       example: "44452675"
 *                     banco:
 *                       type: string
 *                       example: "260"
 *                     pix_key:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     id_seller:
 *                       type: string
 *                       example: "65b47203-8fdc-4115-ad56-a782fd16051f"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-12T20:22:09.576Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-12T20:22:09.576Z"
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
        nome_fantasia,
        email, ticket_medio, numero, complemento, rua, bairro, cidade, estado, pais, cpf,
        nome_mae, postbackUrl, document, name, birthDate, cellphone, account
    } = req.body;

    try {
        
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Token de autenticação ausente ou inválido" });
        }

        const tokenBearer = authHeader.split(' ')[1];
        const tokenRecord = await Token.findOne({ where: { token: tokenBearer, ativo: 1 } });

        if (!tokenRecord) {
            return res.status(403).json({ message: "Autorização falhou!" });
        }

        const id_gateway = tokenRecord.id_gateway;

        // const data = await getTokenInfratec();
        // const token = 'Bearer ' + data.access_token;
        // const response = await fetch(`${process.env.INFRATEC_API}/api/charges/partners/users`, {
        //     method: 'POST',
        //     headers: {            
        //         'Content-Type': 'application/json',            
        //         'Authorization': token,
        //         'Accept': '*/*',
        //         'Accept-Encoding': 'gzip,deflate,br',
        //         'Connection': 'keep-alive'
        //     },
        //     body: JSON.stringify({ 
        //         document,
        //         name,
        //         birthDate,
        //         cellphone,
        //         email,
        //         account
        //     })
        // });

        // if (!response.ok) {
        //     throw new Error(`httpError ${response.status} - ${response.statusText}`);
        // }

        // const responseData = await response.json();
        // console.log('Response Data:', responseData);
        
        const existingSubconta = await SubContaSeller.findOne({
            where: { cnpj: document }
        });

        if (existingSubconta) {
            // Atualiza a subconta existente
            await SubContaSeller.update({           
                nome_fantasia,
                razao_social: name,
                cnpj: document,
                telefone: cellphone,
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
                data_nascimento: birthDate,
                postbackUrl,               
                agencia: account.agency,
                conta: account.number,
                banco: account.bankCode,
                pix_key: account.pixKey
            }, {
                where: { cnpj: document}
            });

            return res.status(200).json({ 
                message: 'Subconta Seller updated successfully',
                data: { cnpj: document }
            });
        }
        const uuid = await uuidv4();
        // Cria uma nova subconta se não existir
        const newSubcontaSeller = await SubContaSeller.create({
            id_gateway,            
            nome_fantasia,
            razao_social: name,
            cnpj: document,
            telefone: cellphone,
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
            data_nascimento: birthDate,
            postbackUrl,
            status: 0,
            motivo_status: 'Aguardando liberação',
            agencia: account.agency,
            conta: account.number,
            banco: account.bankCode,
            pix_key: account.pixKey,
            id_seller: uuid
        });

        const gateway = await Gateway.findOne({ where: { id: newSubcontaSeller.id_gateway } });

        // Cria o saldo apenas para subcontas novas
        await SaldoGateway.create({
            val_disponivel: 0,
            val_reserva: 0,
            id_seller: newSubcontaSeller.id_seller,
            id_gateway: gateway.id,
            id_usuario: gateway.user_id
        });

        res.status(201).json({ message: 'Subconta Seller created successfully', data: newSubcontaSeller });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to create or update subconta seller', error });
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