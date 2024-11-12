const express = require('express');
const Withdraw = require('../db/models/withdraw'); 
const router = express.Router();

router.post('/cash-out', async (req, res) => {
    const {
        token_id, external_id, end_to_end, id_gateway, id_user, amount,
        document, receiver_name, pix_key, pix_type, status, postbackUrl_gateway, postbackUrl
    } = req.body;

    try {        
         const whitdraw = await Withdraw.create({
            token_id,
            external_id,
            end_to_end,
            id_gateway,
            id_user,
            amount,
            document,
            receiver_name,
            pix_key,
            pix_type,
            status,
            postbackUrl_gateway,
            postbackUrl
        });                
        res.status(201).json({ message: 'Solicitação de saque criada com sucesso!'});
    
        console.log(whitdraw);
        
    } catch (error) {        
        res.status(500).json({ message: 'Falha na solicitação de saque!', error });
    }    
});


module.exports = router;