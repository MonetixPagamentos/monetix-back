const express = require('express');
const router = express.Router();
const enviarEmail = require('../components/email');
const User = require('../db/models/user');
require('dotenv').config();


router.get('/send-email/:to/:subject/:text', async (req, res) => {

    const { to, subject, text } = req.params;

    const textEmail = process.env.API_BASE_URL +`/email/ativacao-user/${text}`
    try {
        await enviarEmail(to, subject, textEmail);
        return res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to send email' });
    }
});

router.get('/ativacao-user/:id_user', async (req, res) => {
    const { id_user } = req.params;
    const user = await User.update({status: 1, verificacao_email: 1},{where: { id: id_user, verificacao_email: 0 }});   
    res.redirect(process.env.API_BASE_URL+"/login");       
});

module.exports = router;