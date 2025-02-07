const { now } = require('sequelize/lib/utils');
const SaldoGateway = require('../db/models/saldoGateway');
const TaxaGateway = require('../db/models/taxaGateway');
const Transactions = require('../db/models/transactions');
const TransactionItem = require('../db/models/transactionItem');
const SubContaSeller = require('../db/models/subContaSeller');

require('dotenv').config();

async function getTokenSSGBank() {
    try {
        const payload = {
            grant_type: 'client_credentials',
            client_id: process.env.CLIENT_ID_SSGB,
            client_secret: process.env.CLIENT_SECRET_SSGB
        };
        const response = await fetch(process.env.URL_API_TOKEN_SSGB + 'oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Erro ao obter token:', error);
    }
}

async function integraUserRastrac(data) {
    try {
        const response = await fetch(process.env.API_RASTRAC + '/user/register-rastrac', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Usuário registrado com sucesso:', result);
        } else {
            const error = await response.json();
            console.error('Erro ao registrar o usuário:', error.message || error);
        }
    } catch (err) {
        console.error('Erro na requisição:', err);
    }
}

async function integraPedidoRastrac(pedido, item, seller, token) {
    const data = {
        pedido,
        item,
        seller
    }

    try {
        const response = await fetch(`${process.env.API_RASTRAC}/webhook/pedido/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('pedido integrado com sucesso:', result);
        } else {
            const error = await response.json();
            console.error('Erro ao integrar pedido:', error.message || error);
        }
    } catch (err) {
        console.error('Erro na requisição:', err);
    }
};

async function atualizaTranzacao(id, status_transaction, reqBody) {
    const transaction = await Transactions.findOne({ where: { idOriginTransaction: id } });
    const itens = await TransactionItem.findAll({ where: { id_transaction: transaction.id } });
    const subconta = await SubContaSeller.findOne({ where: { id_seller: transaction.id_seller } });

    const transStatus = await Transactions.update(
        {
            status: status_transaction,
            payment_date: Date.now()
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

    try {
        console.log('Enviado POSTBACK para ----> ' + transaction.postback_url)
        if (transaction.postback_url) {
            const response = await fetch(transaction.postback_url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reqBody)
            });
        }
    } catch (error) {
        console.error('POSTBACK INVALIDO:', error.message || error);
    } finally {
        return res.status(200).json({ message: 'SUCCESS' });
    }
}

async function refreshSaldoGateway(id_gateway, id_seller, valor) {
    try {

        const taxaGateway = await TaxaGateway.findOne({ where: { id_gateway: id_gateway } });

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

module.exports = { atualizaTranzacao, getTokenSSGBank, integraPedidoRastrac, integraUserRastrac };