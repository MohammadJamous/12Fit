const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "12Fit API",
      version: "1.0.0",
      description: "API documentation for 12Fit fitness platform",
    },
    servers: [
  {
    url: "http://localhost:8080/api/v1",
    description: "Local API v1",
  },
  {
    url: "https://one2fit.onrender.com/api/v1",
    description: "Production API v1",
  },
],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Mohammad" },
            email: { type: "string", example: "user@test.com" },
            password: { type: "string", example: "123456" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "user@test.com" },
            password: { type: "string", example: "123456" },
          },
        },
        WorkoutInput: {
          type: "object",
          properties: {
            goal: { type: "string", example: "Build muscle" },
            level: { type: "string", example: "Beginner" },
            plan: {
              type: "array",
              items: { type: "string" },
              example: ["Push ups", "Squats", "Plank"],
            },
          },
        },
        ProgressInput: {
          type: "object",
          properties: {
            day_name: { type: "string", example: "Monday" },
            weight: { type: "number", example: 75 },
            chest: { type: "number", example: 95 },
            waist: { type: "number", example: 80 },
            hips: { type: "number", example: 90 },
            arms: { type: "number", example: 35 },
            bodyFat: { type: "number", example: 18 },
            notes: { type: "string", example: "Good progress" },
          },
        },
        ProductInput: {
          type: "object",
          properties: {
            name: { type: "string", example: "Protein Powder" },
            price: { type: "number", example: 25 },
            category: { type: "string", example: "Supplements" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;