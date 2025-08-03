const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Authentication System API",
      version: "1.0.0",
      description: "API documentation for the secure user authentication system",
    },
    servers: [
      {
        url: "http://localhost:5000",        
      },
    ],
  },
  apis: ["./routes/*.js"], 
};
const swaggerSpec = swaggerJSDoc(options);
function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
module.exports = swaggerDocs;