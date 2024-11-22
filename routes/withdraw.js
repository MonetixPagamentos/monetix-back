const express = require('express');
const { Sequelize, DataTypes, NOW, where } = require('sequelize');
const Withdraw = require('../db/models/withdraw');
const Gateway = require('../db/models/gateway');
const SaldoGateway = require('../db/models/saldoGateway');
const { v4: uuidv4 } = require('uuid');
const SubContaSeller = require('../db/models/subContaSeller');
const router = express.Router();
const enviarEmail = require('../components/email');
const { emailSolictacaoSaque, emailAprovacaoSaque, emailCancelaSaque } = require('../components/templates');
const { now } = require('sequelize/lib/utils');

router.post('/update-cash-out', async (req, res) => {
    try {
        const {
            id_gateway,
            id_withdraw,
            approve
        } = req.body;

        const whitdraw = await Withdraw.findOne({ where: { id: id_withdraw } });

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
        if (whitdraw.type === 'SALDO') {
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

            } else if (approve === "CANCELED") {
                await SaldoGateway.update(
                    {
                        val_saque: 0
                    },
                    {
                        where: { id_gateway: id_gateway }
                    }
                );
            }

        } else { // antecipacao
            if (approve === "PAID") {
                await SaldoGateway.update(
                    {
                        val_reserva: Sequelize.literal(`val_reserva - val_saque_reserva`),
                        val_saque_reserva: 0
                    },
                    {
                        where: { id_gateway: id_gateway }
                    }
                );
            } else if (approve === "CANCELED") {
                await SaldoGateway.update(
                    {
                        val_saque_reserva: 0
                    },
                    {
                        where: { id_gateway: id_gateway }
                    }
                );
            }
        }

        var msgEmail;
        var title;
        if (approve === "CANCELED") {
            msgEmail = emailCancelaSaque;
            title = 'Solicitação de saque cancelada';
        } else {
            msgEmail = emailAprovacaoSaque;
            title = 'Solicitação de saque aprovada';
        }

        const now = new Date();
        const formattedDate = now.toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        });

        msgEmail = msgEmail.replace('#valor#', (whitdraw.amount / 100).toFixed(2));
        msgEmail = msgEmail.replace('#data#', formattedDate);

        const gateway = await Gateway.findOne({ where: { id: id_gateway } });

        await enviarEmail(gateway.email_responsable, title, '', msgEmail);

        res.status(200).json({ message: title });
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
            attributes: ['id', 'gateway_name', 'document_gateway', 'user_id', 'token_id', 'email_responsable']
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
            postbackUrl: 'https://monetix.com',
            type: 'SALDO'
        });

        const now = new Date();
        const formattedDate = now.toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        });

        var msgEmail = emailSolictacaoSaque;
        msgEmail = msgEmail.replace('#valor#', Number(amount_withdraw / 100).toFixed(2));
        msgEmail = msgEmail.replace('#data#', formattedDate);

        await enviarEmail(gateway.email_responsable, 'Solicitação de saque', '', msgEmail);
        res.status(201).json({ message: 'Solicitação de saque criada com sucesso!' });

        console.log(whitdraw);

    } catch (error) {
        res.status(500).json({ message: 'Falha na solicitação de saque!', error });
    }
});

router.post('/cash-out-antecipacao', async (req, res) => {

    try {
        const { id_gateway,
            receiver_name,
            pix_key,
            pix_type
        } = req.body;

        const sellers = await SubContaSeller.findAll({
            where: { id_gateway: id_gateway, status: 1 },
            attributes: ['id']
        });

        const sellerIds = sellers.map(seller => seller.id);

        const saldo_gateways = await SaldoGateway.findAll({ where: { id_seller: sellerIds } });

        var amount_withdraw = 0;

        for (const saldo of saldo_gateways) {

            amount_withdraw = amount_withdraw + Number(saldo.val_reserva);
            await SaldoGateway.update(
                {
                    val_saque_reserva: Sequelize.literal(`val_saque_reserva + ${Number(saldo.val_reserva)}`),
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
            postbackUrl: 'https://monetix.com',
            type: 'ANTECIPACAO'
        });

        const now = new Date();
        const formattedDate = now.toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        });

        var msgEmail = emailSolictacaoSaque;
        msgEmail = msgEmail.replace('#valor#', Number(amount_withdraw / 100).toFixed(2));
        msgEmail = msgEmail.replace('#data#', formattedDate);

        await enviarEmail(gateway.email_responsable, 'Solicitação de saque', '', msgEmail);

        res.status(201).json({ message: 'Solicitação de saque de reserva criada com sucesso!' });

        console.log(whitdraw);

    } catch (error) {
        res.status(500).json({ message: 'Falha na solicitação de saque!', error });
    }
});

module.exports = router;