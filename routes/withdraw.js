const express = require('express');
const { Sequelize, DataTypes, NOW } = require('sequelize');
const Withdraw = require('../db/models/withdraw');
const Gateway = require('../db/models/gateway');
const SaldoGateway = require('../db/models/saldoGateway');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.post('/update-cash-out', async (req, res) => {
    try {
        const { id_gateway,
            id_withdraw,
            approve
        } = req.body;

        if (approve === "PAID" || approve === "CANCELED") {
            await Withdraw.update(
                {
                    status: approve,
                    payment_date: Sequelize.fn('NOW')
                },
                {
                    where: { id: id_withdraw, id_gateway: id_gateway }
                }
            );
        }

        if (approve === "PAID") {
            await SaldoGateway.update(
                {
                    val_disponivel: Sequelize.literal(`val_disponivel - val_saque`),
                    val_saque: 0
                },
                {
                    where: { id_gateway: id_gateway }
                }
            );
            res.status(200).json({ message: 'Aprovação de saque realizada com sucesso!' });
        } else if (approve === "CANCELED") {
            await SaldoGateway.update(
                {
                    val_saque: 0
                },
                {
                    where: { id_gateway: id_gateway }
                }
            );
            res.status(200).json({ message: 'Rejeição de saque realizada com sucesso!' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar saque, chama o Jung ou o Bona logo! ' + error });
    }
});

router.post('/cash-out', async (req, res) => {
    try {
        const { id_gateway,
            receiver_name,
            pix_key,
            pix_type,
            saldos
        } = req.body;

        var amount_withdraw = 0;

        for (const saldo of saldos) {
            amount_withdraw = amount_withdraw + Number(saldo.saldo);
            await SaldoGateway.update(
                {
                    val_saque: Sequelize.literal(`val_saque + ${Number(saldo.saldo)}`),
                },
                {
                    where: { id_gateway: id_gateway, id_seller: saldo.id }
                }
            );
        }

        const gateway = await Gateway.findOne({
            where: { id: id_gateway },
            attributes: ['id', 'gateway_name', 'document_gateway', 'user_id', 'token_id']
        });

        const uuid = uuidv4();


        const whitdraw = await Withdraw.create({
            token_id: gateway.token_id,
            external_id: uuid,
            end_to_end: uuid,
            id_gateway: id_gateway,
            id_user: gateway.user_id,
            amount: amount_withdraw,
            document: gateway.document_gateway,
            receiver_name: receiver_name,
            pix_key: pix_key,
            pix_type: pix_type,
            status: 'PENDING',
            postbackUrl_gateway: 'https://monetix.com',
            postbackUrl: 'https://monetix.com'
        });
        res.status(201).json({ message: 'Solicitação de saque criada com sucesso!' });

        console.log(whitdraw);

    } catch (error) {
        res.status(500).json({ message: 'Falha na solicitação de saque!', error });
    }
});


module.exports = router;