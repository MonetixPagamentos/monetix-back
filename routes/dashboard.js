const express = require('express');
const router = express.Router();
const Transactions = require('../db/models/transactions');
const Withdraw = require('../db/models/withdraw');
const SaldoGateway = require('../db/models/saldoGateway');
const SubContaSeller = require('../db/models/subContaSeller');
const { Op, Sequelize, fn, col } = require('sequelize');

router.get('/cash-in/:id_gateway/:start_date/:end_date', async (req, res) => {
    const { id_gateway, start_date, end_date } = req.params;
    try {

        if (!id_gateway) {
            return res.status(400).json({ error: 'id_gateway é obrigatório' });
        }


        const transactions = await Transactions.findAll({
            where: {
                id_gateway: id_gateway,
                created_at: {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
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
                id_seller:
                {
                    [Op.in]: sellerIds 
                }
            }, attributes: [                
                [fn('SUM', col('val_disponivel')), 'val_disponivel']
            ]
        });

        const saldoReserva = await SaldoGateway.findOne({
            where: {id_gateway: id_gateway}, 
            attributes: [
                [fn('SUM', col('val_reserva')), 'val_reserva']
            ]
        });
        
        const saldoBloqueado = await SaldoGateway.findAll({
            where: {id_gateway: id_gateway,
                id_seller:
                {
                    [Op.notIn]: sellerIds 
                }
            }, 
            attributes: [
                [fn('SUM', col('val_disponivel')), 'val_disponivel']
            ]
        });

        return res.status(200).json( {withdraw: withdraw, 
                                      saldoGateway: saldoGateway, 
                                      saldoReserva: saldoReserva, 
                                      saldoBloqueado: saldoBloqueado});

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

module.exports = router;
