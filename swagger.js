const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentação da API com segurança',
        },
        servers: [
            {
                url: process.env.API_BASE_URL, // Altere para a URL da sua API
                //url: "http://localhost:3000/api-docs/"
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'https',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        
    },
    
    apis: ['./routes/*.js'], // Caminho para os arquivos que contêm as anotações da documentação
};



const swaggerDocs = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
    app.use('/documentacao-monetix', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;