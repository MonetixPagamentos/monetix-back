const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Documentação',
            version: '1.0.0',
            description: 'Documentação Monetix',
        },
        contact: {
            name: 'Equipe Monetix',
            email: 'suporte@monetixpagamentos.com',
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
    app.use('/documentacao-monetix', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
        customCss: `
            .swagger-ui .topbar { background-color: #28932b; }
            .swagger-ui .info .title { color: #28932b; font-family: 'Arial', sans-serif; }
        `,
        customSiteTitle: 'Documentação Monetix',
        // customfavIcon: '/img/favicon.ico', // Opcional: Favicon personalizado
    }));
};

module.exports = setupSwagger;