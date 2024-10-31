const express = require('express');
const Transactions = require('../db/models/transactions');
const router = express.Router();

router.post('/nova-transacao', async (req, res) => {
  try {
    const {
      amount,
      cardNumber,
      cvv,
      description,
      expirationDate,
      idOriginTransaction,
      nameCreditCard,
      numbersInstallments,
      typePayment,
      payment_method,
      token_gateway,
      id_gateway,
      postback_gateway
    } = req.body;

    const transaction = await Transactions.create({
      amount,
      cardNumber,
      cvv,
      description,
      expirationDate,
      idOriginTransaction,
      nameCreditCard,
      numbersInstallments,
      typePayment,
      payment_method,
      token_gateway,
      id_gateway,
      postback_gateway
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar transação." });
  }
});

module.exports = router;