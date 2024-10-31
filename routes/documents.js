const express = require('express');
const Documents = require('../db/models/documents'); 
const router = express.Router();

router.post('/novo-documento', async (req, res) => {
  
    const { 
        id_gateway,
        id_user,
        contrato_social,
        documento_frente,
        documento_verso,
        selfie
      } = req.body;
    
      try {
        const documents = await Documents.create({ 
          id_gateway,
          id_user,
          contrato_social,
          documento_frente,
          documento_verso,
          selfie        
        });
    
        res.status(201).json(documents); 
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao inserir dados do usuário.' }); 
      }
});



module.exports = router;