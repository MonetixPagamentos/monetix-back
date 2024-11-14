const express = require('express');
const router = express.Router();
const Transactions = require('../db/models/transactions');
const Withdraw = require('../db/models/withdraw');
const SaldoGateway = require('../db/models/saldoGateway');
const SubContaSeller = require('../db/models/subContaSeller');
const {Sequelize, Op, fn, col } = require('sequelize');
const sequelize = require('../db/connection');

router.get('/cash-in/:id_gateway/:start_date/:end_date', async (req, res) => {
    const { id_gateway, start_date, end_date } = req.params;

    try {
        if (!id_gateway) {
            return res.status(400).json({ error: 'id_gateway é obrigatório' });
        }

        // Função para converter datas em formatos variados para o formato Date
        const parseDate = (date) => {
            // Verifica se a data está no formato dd-mm-aaaa
            const isDayFirstFormat = /^\d{2}-\d{2}-\d{4}$/.test(date);
            
            if (isDayFirstFormat) {
                const [day, month, year] = date.split('-');
                return new Date(`${year}-${month}-${day}`);
            }
            
            // Tenta criar um objeto Date caso a data já esteja em um formato Date string válido
            const parsedDate = new Date(date);
            
            // Verifica se o objeto Date é válido
            if (!isNaN(parsedDate)) {
                return parsedDate;
            } else {
                throw new Error("Formato de data inválido");
            }
        };

        const startDateFormatted = parseDate(start_date);
        const endDateFormatted = parseDate(end_date);

        const transactions = await Transactions.findAll({
            where: {
                id_gateway: id_gateway,
                created_at: {
                    [Op.between]: [startDateFormatted, endDateFormatted]
                }
            }
        });

        return res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});


router.get('/cash-out/:id_gateway', async (req, res) => {
    const { id_gateway } = req.params;
    try {
        if (!id_gateway) {
            return res.status(400).json({ error: 'id_gateway é obrigatório' });
        }

        const withdraw = await Withdraw.findAll({
            where: { id_gateway: id_gateway }
        });
    
        const sellers = await SubContaSeller.findAll({where:{id_gateway: id_gateway, status: 1}, attributes: ['id']});

        const sellerIds = sellers.map(seller => seller.id);                                        

        const saldoGateway = await SaldoGateway.findOne({
            where: {
                id_gateway: id_gateway,
                id_seller: {
                    [Op.in]: sellerIds
                }
            },
            attributes: [
                [
                    Sequelize.literal('SUM(val_disponivel - val_saque)'),
                    'val_disponivel'
                ]
            ]
        });

        const saldoReserva = await SaldoGateway.findOne({
            where: {id_gateway: id_gateway}, 
            attributes: [
                [fn('SUM', col('val_reserva')), 'val_reserva']
            ]
        });
        
        const saldoBloqueadoResult = await SaldoGateway.findAll({
            where: {
                id_gateway: id_gateway,
                id_seller: {
                    [Op.notIn]: sellerIds
                }
            }, 
            attributes: [
                [fn('SUM', col('val_disponivel')), 'val_disponivel']
            ]
        });
        
        // Extrai o valor retornado e define como 0 caso seja nulo ou NaN
        const saldoBloqueado = saldoBloqueadoResult[0]?.dataValues?.val_disponivel || 0;

        return res.status(200).json( {withdraw: withdraw, 
                                      saldoGateway: saldoGateway, 
                                      saldoReserva: saldoReserva, 
                                      saldoBloqueado: {val_disponivel: saldoBloqueado}});

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

// precisa terminar o display
router.get('/display/:id_gateway/:dias', async (req, res) => {
    const { id_gateway, dias } = req.params;
    try {
        if (!id_gateway) {
            return res.status(400).json({ error: 'id_gateway é obrigatório' });
        }
           
        const sellers = await SubContaSeller.findAll({where:{id_gateway: id_gateway, status: 1}, attributes: ['id']});

        const sellerIds = sellers.map(seller => seller.id);                                        

        const saldoGateway = await SaldoGateway.findAll({
            where: {
                id_gateway: id_gateway,
                id_seller:
                {
                    [Op.in]: sellerIds 
                }
            }, attributes: [                
                [fn('SUM', col('val_disponivel')), 'val_disponivel']
            ]
        });

        const saldoReserva = await SaldoGateway.findAll({
            where: {id_gateway: id_gateway}, 
            attributes: [
                [fn('SUM', col('val_reserva')), 'val_reserva']
            ]
        });
        
        const saldoCartao = await Transactions.findAll({where:{id_gateway: id_gateway, satus: "PAID", payment_method: "CARD"}});
        const saldoPix = await Transactions.findAll({where:{id_gateway: id_gateway, satus: "PAID", payment_method: "PIX"}});

        return res.status(200).json( {saldoGateway: saldoGateway, 
                                      saldoReserva: saldoReserva, 
                                      saldoCartao: saldoCartao,
                                      saldoPix: saldoPix});

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

router.get('/subconta/:id_gateway', async (req, res) => {
    const { id_gateway } = req.params;
    try {
        if (!id_gateway) {
            return res.status(400).json({ error: 'id_gateway é obrigatório' });
        }

        const subContasComSaldo = await sequelize.query(
            `
            SELECT SUM(b.val_disponivel - b.val_saque) AS saldo, a.*
            FROM subconta_sellers a
            INNER JOIN saldo_gateways b ON b.id_seller = a.id
            WHERE a.id_gateway = :id_gateway
            GROUP BY a.id
            `,
            {
                replacements: { id_gateway: id_gateway },
                type: sequelize.QueryTypes.SELECT
            }
        );
    
        return res.status(200).json(subContasComSaldo);

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

router.get('/consulta-antecipacao/:id_gateway', async (req, res) => {
    const { id_gateway } = req.params;
    try {
        if (!id_gateway) {
            return res.status(400).json({ error: 'id_gateway é obrigatório' });
        }

        const withdraw = await Withdraw.findAll({
            where: { id_gateway: id_gateway, status: 'PENDING' }
        });

        if (withdraw.length === 0) {
            return res.status(200).json({ message: 'Não existe transações pendentes' });
        } else {
            return res.status(200).json({ message: 'Existe transação pendente' });
        }

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});


router.get('/subconta-movements/:id_seller', async (req, res) => {
    const { id_seller } = req.params;
    try {
        if (!id_seller) {
            return res.status(400).json({ error: 'id_seller é obrigatório' });
        }
        
        const transactions = await Transactions.findAll({
            where: {
                id_seller: id_seller
            }
        });


        return res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

module.exports = router;
