const express = require('express');
const router = express.Router();
const Proposta = require('../db/models/proposta');

router.post('/cadastro-cliente', async (req, res) => {
    const {
        nome,
        email,
        telefone,
        cpf,
        dt_nasc,
        razao_social,
        nome_fantasia,
        cnpj,
        dt_abertura,
        ticket_medio_mes,
        cep,
        rua,
        bairro,
        cidade,
        estado,
        pais,
        complemento,
        numero,
        banco,
        agencia,
        conta,
        tipo_conta,
        nome_mae,
        tipo_servico
    } = req.body;
    
    try {
        const novaProposta = await Proposta.create({
            nome,
            email,
            telefone,
            cpf,
            dt_nasc,
            razao_social,
            nome_fantasia,
            cnpj,
            dt_abertura,
            ticket_medio_mes,
            cep,
            rua,
            bairro,
            cidade,
            estado,
            pais,
            complemento,
            numero,
            banco,
            agencia,
            conta,
            tipo_conta,
            nome_mae,
            tipo_servico
        });
    
        res.status(201).json({
            message: 'Proposta criada com sucesso!',
            proposta: novaProposta
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erro ao criar a proposta.',
            error: error.message
        });
    }    
});

module.exports = router;
