const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', 
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.EMAIL_PASSWORD 
  }
});

async function enviarEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: '"MONETIX" <no-reply@monetixpagamentos.com>', 
      to: to, // pra quem
      subject: subject, // assunto      
      text: text, // texto normal
      html: html // html 
    });

    console.log('E-mail enviado: %s', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  } 
}

module.exports = enviarEmail;