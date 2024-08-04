import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BlitzPDF API',
            version: '1.0.0',
            description: 'API for generating PDFs from React components with Tailwind CSS',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);