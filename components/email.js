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
      text: text // corpo      
    });

    console.log('E-mail enviado: %s', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  } 
}

module.exports = enviarEmail;

// feito para testar o email....

// const destinatario = 'gianbona15@gmail.com';
// const assunto = 'ME MAMA HOJE JUNG?';
// const texto = 'Clique no link abaixo para dar uma mamada virtual.';
// const htmlContent = `
//                       <!DOCTYPE html>
//                       <html lang="pt-BR">
//                       <head>
//                         <meta charset="UTF-8">
//                         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                         <title>E-mail com Coração</title>
//                         <style>
//                           .container {
//                             text-align: center;
//                             padding: 20px;
//                             font-family: Arial, sans-serif;
//                             color: #333;
//                           }
//                           .heart {
//                             color: #e63946;
//                             font-size: 48px;
//                           }
//                           h1 {
//                             color: #333;
//                           }
//                         </style>
//                       </head>
//                       <body>
//                         <div class="container">
//                           <h1>😊</h1>
//                           <p class="heart">❤️</p>
//                           <p>Com carinho para você!</p>
//                         </div>
//                       </body>
//                       </html>
//                       `;


// enviarEmail(destinatario, assunto, texto, htmlContent)
//   .then(() => console.log('E-mail enviado com sucesso!'))
//   .catch((error) => console.error('Erro ao enviar o e-mail:', error));