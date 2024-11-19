const express = require('express');
const router = express.Router();
const sequelize = require('../db/connection');
const { Sequelize, where } = require('sequelize');
const Gateway = require('../db/models/gateway');
const Documents = require('../db/models/documents');
const TaxaGateway = require('../db/models/taxaGateway');
const SubContaSeller = require('../db/models/subContaSeller');
const path = require('path');
const Transactions = require('../db/models/transactions');
const { v4: uuidv4 } = require('uuid');
const SaldoGateway = require('../db/models/saldoGateway');
const Token = require('../db/models/tokens');

router.get('/list-gateway', async (req, res) => {
    try {
        const gateway = await sequelize.query(
            `
            SELECT g.id, 
            g.gateway_name, 
            g.document_gateway, 
            g.status,
            COALESCE(SUM(sg.val_disponivel), 0) AS saldo
            FROM defaultdb.gateways g
            LEFT JOIN defaultdb.saldo_gateways sg ON sg.id_gateway = g.id
            GROUP BY g.id, g.gateway_name, g.document_gateway
                    `,
            {
                type: sequelize.QueryTypes.SELECT
            }
        );
        return res.status(200).json(gateway);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/cancel-transaction/:id_transaction', async (req, res) => {

    const { id_transaction } = req.params;
    try {
        const tran = await Transactions.findOne({ where: { id: id_transaction } });
        
        if (!tran) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        if (tran.payment_method === "PIX" && tran.updated_balance === 1) {
            await cancelePaymentPix(id_transaction);
        } else if (tran.payment_method === "CARD" && tran.updated_balance === 1) {
            await cancelePaymentCard(id_transaction);
        } else {
            return res.status(400).json({ message: "Transaction cannot be canceled" });
        }

        res.status(200).json({ message: "Transaction canceled successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Failed to cancel transaction" });
    }
});

router.get('/list-transactions-seller/:id_seller', async (req, res) => {
    try {
        const { id_seller} = req.params;
        const transactions = await sequelize.query(
            `
                SELECT 
                t.id as id_transaction,
                t.id_gateway,
                t.amount, 
                t.payment_method,
                t.created_at as payment_date,
                t.status,
                t.integridade 
                FROM transactions t               
                WHERE t.id_seller = :id_seller
            `,
            {
                replacements: { id_seller },
                type: sequelize.QueryTypes.SELECT
            }
        );
        return res.status(200).json(transactions);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/list-transactions/:id_gateway', async (req, res) => {
    try {
        const { id_gateway } = req.params;
        const transactions = await sequelize.query(
            `
                SELECT 
                t.id as id_transaction,
                t.id_gateway, 
                g.gateway_name,
                g.document_gateway, 
                t.amount, 
                t.payment_method,
                t.created_at as payment_date,
                t.status,
                t.integridade 
                FROM transactions t
                INNER join gateways g on g.id = t.id_gateway
                 WHERE t.id_gateway = :id_gateway
            `,
            {
                replacements: { id_gateway },
                type: sequelize.QueryTypes.SELECT
            }
        );
        return res.status(200).json(transactions);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/list-transactions-itens/:id_transaction', async (req, res) => {
    try {
        const { id_transaction } = req.params;
        const itens = await sequelize.query(` 
                             select description, 
                             amount, 
                             qtde 
                             from transaction_items 
                             where id_transaction = :id_transaction `,
            {
                replacements: { id_transaction },
                type: sequelize.QueryTypes.SELECT
            }
        );
        return res.status(200).json(itens);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;

    const filepath = path.join(__dirname.replace('\\routes', ''), 'uploads', filename);
    res.download(filepath, (err) => {
        if (err) {
            console.error('Erro ao enviar o arquivo:', err);
            res.status(404).send('Arquivo não encontrado.');
        }
    });
});

router.get('/document/:id_gateway', async (req, res) => {
    try {
        const { id_gateway } = req.params;
        const document = await Documents.findAll({ where: { id_gateway: id_gateway } });
        return res.status(200).json({ document: document });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

});

router.get('/dados-gateway/:id_gateway', async (req, res) => {
    try {
        const { id_gateway } = req.params;

        const gateway = await Gateway.findAll({ where: { id: id_gateway } });
        const document = await Documents.findAll({ where: { id_gateway: id_gateway } });
        const taxa = await TaxaGateway.findAll({ where: { id_gateway: id_gateway } });
        const subconta = await SubContaSeller.findAll({ where: { id_gateway: id_gateway } });

        return res.status(200).json({
            gateway: gateway,
            document: document,
            taxa: taxa,
            subconta: subconta
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/taxa/:id_gateway', async (req, res) => {
    try {
        const { id_gateway } = req.params;      
        const taxa = await TaxaGateway.findAll({ where: { id_gateway: id_gateway } });     
        return res.status(200).json(taxa);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/update-status-gateway', async (req, res) => {
    const { id_gateway, status } = req.body;

    try {
        const gateway = await Gateway.update(
            { status: status },
            { where: { id: id_gateway } }
        );

        // habilita / desabilita o token
        await Token.update({ativo: status}, {where: {id_gateway: id_gateway}});

        if (gateway[0] === 0) {
            return res.status(404).json({ error: 'Gateway não encontrado' });
        }
        return res.status(200).json({ message: 'Status do gateway atualizado com sucesso!' });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Erro ao alterar status do gateway' });
    }
});


// revisar
async function cancelePaymentCard(idTransaction) {
    try {
        const transaction = await Transactions.findOne({ where: { id: idTransaction } });
        const token = getTokenAstraPay();
        if (transaction) {
            const response = await fetch(process.env.URL_ASTRAPAY + `v1/credit/${transaction.credit_card_id}/cancel`, {
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'x-transaction-id': uuidv4(),
                    'Content-Type': 'application/json',
                    'Authorization': ' Bearer ' + token
                },
                body: JSON.stringify({creditCardId: transaction.creditCardId})
            });

            if (response.ok) {
                if (refundPayment(idTransaction)) {
                    return res.status(200).json({ message: "transação cancelada!" });
                }
                return res.status(500).json({ message: "falha ao estorar o saldo do gateway!" });
            } else {
                return res.status(500).json({ message: "Falha no cancelamento da transação!" });
            }
        }
    } catch (error) {
        console.error('Erro ao realizar pagamento:', error.response ? error.response.data : error.message);
        return false;
    }
}

// revisar
async function cancelePaymentPix(idTransaction) {
    try {
        const transaction = await Transactions.findOne({ where: { id: idTransaction } });
        const token = getTokenAstraPay();
        if (transaction) {
            const body = {
                amount: transaction.amount,
                end_to_end: transaction.end_to_end,
                txid: transaction.txid,
                description: 'Cancelado pela AI - Anti-Fraude @copryright Cortex'
            }

            const response = await fetch(process.env.URL_ASTRAPAY + `charge/v1/refunds`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'x-transaction-id': uuidv4(),
                    'Content-Type': 'application/json',
                    'Authorization': ' Bearer ' + token
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                if (refundPayment(idTransaction)) {
                    return res.status(200).json({ message: "transação cancelada!" });
                }
                return res.status(500).json({ message: "falha ao estorar o saldo do gateway!" });
            } else {
                return res.status(500).json({ message: "Falha no cancelamento da transação!" });
            }
        }
    } catch (error) {
        console.error('Erro ao realizar pagamento:', error.response ? error.response.data : error.message);
        return false;
    }
}

async function refundPayment(idTransaction) {
    const trans = await Transactions.update(
        { status: REFUND },
        { where: { id: idTransaction } }
    );

    if (refundSaldoGateway(trans.id_gateway, trans.id_seller, idTransaction, trans.amount)) {
        return true;
    }

    return false;
}


router.get('/withdraws-all', async (req, res) => {
    
    try {       
        const withdraws = await sequelize.query(
            `
              select 
                w.id,
                w.amount, 
                w.status,
                w.pix_key,
                w.pix_type,
                w.created_at,
                w.payment_date,
                w.receiver_name,
                w.document,
                w.id_gateway,
                g.gateway_name 
            from withdraws w 
            inner join gateways g on g.id = w.id_gateway 
            order by w.created_at 
                        
            `,
            {
               
                type: sequelize.QueryTypes.SELECT
            }
        );

        return res.status(200).json(withdraws);

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

// async function refundSaldoGatewayCard(id_gateway, id_seller, idTransaction, valor, numbersInstallments) {
//     try {

//       const taxaGateway = await TaxaGateway.findOne({ id_gateway: id_gateway });

//       const taxa_reserva = taxaGateway.taxa_reserva;
//       const campo = `taxa_cartao_${numbersInstallments}`;
//       const taxa = taxaGateway[campo];

//       var descTaxCard = (valor * (taxa / 100));
//       var valReserve = (valor * (taxa_reserva / 100));

//       const valDisponivel = valor - descTaxCard - valReserve - taxaGateway.taxa_transacao;

//       const [rowsAffected]  =  await SaldoGateway.update(
//         {
//           val_disponivel: Sequelize.literal(`val_disponivel - ${valDisponivel}`),          
//         },
//         {
//           where: { id_gateway: id_gateway, id_seller: id_seller }
//         }
//       );
//       if (rowsAffected > 0) {
//         await Transactions.update(
//             { updated_balance: 2 },
//             { where: { id: idTransaction } }
//         );
//     }
//     console.log("Campos atualizados com sucesso.");
//     return true;
// } catch (error) {
//     console.error("Erro ao atualizar os campos:", error);
//     return false;
// }
//   }


// async function refundSaldoGatewayPix(id_gateway, id_seller, idTransaction, valor) {
//     try {

//         const taxaGateway = await TaxaGateway.findOne({ id_gateway: id_gateway });

//         const taxa_reserva = taxaGateway.taxa_reserva;
//         const taxa = taxaGateway.taxa_pix;

//         var descTaxCard = (valor * (taxa / 100));
//         var valReserve = (valor * (taxa_reserva / 100));

//         const valDisponivel = valor - descTaxCard - valReserve - taxaGateway.taxa_transacao;

//         const [rowsAffected] = await SaldoGateway.update(
//             {
//                 val_disponivel: Sequelize.literal(`val_disponivel - ${valDisponivel}`),
//             },
//             {
//                 where: { id_gateway: id_gateway, id_seller: id_seller }
//             }
//         );
//         if (rowsAffected > 0) {
//             await Transactions.update(
//                 { updated_balance: 2 },
//                 { where: { id: idTransaction } }
//             );
//         }
//         console.log("Campos atualizados com sucesso.");
//         return true;
//     } catch (error) {
//         console.error("Erro ao atualizar os campos:", error);
//         return false;
//     }
// }

async function refundSaldoGateway(id_gateway, id_seller, idTransaction, valor) {
    try {
        const [rowsAffected] = await SaldoGateway.update(
            {
                val_disponivel: Sequelize.literal(`val_disponivel - ${valor}`),
            },
            {
                where: { id_gateway: id_gateway, id_seller: id_seller }
            }
        );
        if (rowsAffected > 0) {
            await Transactions.update(
                { updated_balance: 2 },
                { where: { id: idTransaction } }
            );
        }
        console.log("Campos atualizados com sucesso.");
        return true;
    } catch (error) {
        console.error("Erro ao atualizar os campos:", error);
        return false;
    }
}

async function getTokenAstraPay() {
    try {
        const response = await fetch(process.env.URL_ASTRAPAY + 'oauth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET
            })
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Erro ao obter token:', error);
    }
}



module.exports = router;