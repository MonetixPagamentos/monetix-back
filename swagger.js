const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentação da API em Node.js',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Substitua pela URL do seu servidor
            },
        ],
    },
    apis: ['./routes/*.js'], // Caminho para os arquivos que contêm as anotações da documentação
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;
