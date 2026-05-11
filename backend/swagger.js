import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Api JM",
      version: '1.0.0',
      description: 'Api JM'
    },
    servers: [
      {
        url: '/',
        description: 'Url Swagger'
      }
    ]
  },

  apis: ['./routes/*.js','./router/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;