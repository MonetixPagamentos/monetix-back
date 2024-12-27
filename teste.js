require('dotenv').config();

console.log('Variáveis carregadas:', {
  URL_ASTRAPAY: process.env.URL_ASTRAPAY,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
});