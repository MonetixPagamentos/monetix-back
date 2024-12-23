const express = require('express');
const router = express.Router();
const Transactions = require('../db/models/transactions');
const SaldoGateway = require('../db/models/saldoGateway');
const TaxaGateway = require('../db/models/taxaGateway');
const { Sequelize } = require('sequelize');

router.post('/postback-pix-payment', async (req, res) => {
    try {
        const {
            id,
            Status,
            paymentDate
        } = req.body;

        const transaction = await Transactions.findOne({where:{ idOriginTransaction: id }});

        if(transaction.updated_balance == 1)  return res.status(201).json({message: 'DUPLICATE EVENT'});

        if (!transaction) {
            throw new Error('Transação não encontrada.');
        }

        console.log('PAGOOOOU');

        var status_transaction;

        if (Status === 1 ) {
            status_transaction = 'PAID';
        } else {
            status_transaction = 'CANCELED'
        }

        const transStatus = await Transactions.update(
            {
                status: status_transaction,
                payment_date: paymentDate
            },
            {
                where: { idOriginTransaction: id }
            }
        );

        if (transStatus) {
            const refreshSaldo = await refreshSaldoGateway(transaction.id_gateway, transaction.id_seller, transaction.amount);
            if (refreshSaldo) {
                await updateBalance(transaction.id);
            }
        }

        try{

            if (transaction.postback_url) {
                const response = await fetch(transaction.postback_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: req.body
                });
            }
        }catch(error){
            console.error('POSTBACK INVALIDO:', error.message || error);
        }finally{
            return res.status(200).json({message: 'SUCCESS'});
        }
        
    } catch (error) {
        console.error('Erro ao processar a transação:', error.message || error);
        res.status(500).json({ message: 'Erro ao processar a transação', error: error.message });
    }
});

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

async function refreshSaldoGateway(id_gateway, id_seller, valor) {
    try {

        const taxaGateway = await TaxaGateway.findOne({where:{ id_gateway: id_gateway }});

        const taxa_reserva = taxaGateway.taxa_reserva;
        const taxa = taxaGateway.taxa_pix;

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


module.exports = router;