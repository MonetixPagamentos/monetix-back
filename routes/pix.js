const express = require('express');
const router = express.Router();
const Transactions = require('../db/models/transactions');
const SaldoGateway = require('../db/models/saldoGateway');


router.post('/postback-pix-payment', async (req, res) => {
    const body = {
        txid,
        amount,
        payer,
        endToEndId,
        type,
        status,
        paymentDate

    } = req.body;

    const transaction = await Transactions.findOne({ end_to_end: txid });

    await Transactions.update(
        {
            status: status,
            payment_date: paymentDate
        },
        {
            where: { end_to_end: txid }
        }
    );

    if (transaction.postback_url) {
        const response = await fetch(transaction.postback_url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (response && response.ok) {
            const refreshSaldo = await refreshSaldoGateway(tokenRecord.id_gateway, transaction.amount);

            if (refreshSaldo) {
                updateBalance(transaction.id);
            }
        }
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

async function refreshSaldoGateway(id_gateway, valor) {
    try {

        const taxaGateway = await TaxaGateway.findOne({ id_gateway: id_gateway });

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
                where: { id_gateway: id_gateway }
            }
        );
        console.log("Campos atualizados com sucesso.");
        return true;
    } catch (error) {
        console.error("Erro ao atualizar os campos:", error);
    }
} 