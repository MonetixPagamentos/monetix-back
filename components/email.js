const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', 
  port: 465, 
  secure: true, 
  auth: {
    user: 'sistema@mycloaker.com', 
    pass: 'Xiomvega1995.' 
  }
});

async function enviarEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: '"MONETIX" <monetix@monetix.com>', 
      to: to, 
      subject: subject, 
      text: text, 
      html: html 
    });

    console.log('E-mail enviado: %s', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

module.exports = enviarEmail;