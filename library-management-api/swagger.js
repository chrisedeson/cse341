const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Library Management API",
    description:
      "A comprehensive API for managing library books and members with borrowing functionality",
    version: "1.0.0",
    contact: {
      name: "Christopher Edeson",
      email: "edesonchristopher@gmail.com",
    },
  },
  host:
    process.env.NODE_ENV === "production"
      ? "library-management-api-ca0s.onrender.com"
      : "localhost:3000",
  basePath: "/api",
  schemes:
    process.env.NODE_ENV === "production" ? ["https"] : ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "Books",
      description: "Book management operations",
    },
    {
      name: "Members",
      description: "Library member management operations",
    },
    {
      name: "Borrowing",
      description: "Book borrowing and returning operations",
    },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'"
    },
    githubAuth: {
      type: "oauth2",
      authorizationUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      flow: "authorizationCode",
      scopes: {
        "user:email": "Access user email",
        "read:user": "Read user profile"
      },
      description: "GitHub OAuth 2.0 authentication"
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  parameters: {
    page: {
      name: "page",
      in: "query",
      description: "Page number for pagination",
      type: "integer",
      minimum: 1,
      default: 1,
    },
    limit: {
      name: "limit",
      in: "query",
      description: "Number of items per page",
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 10,
    },
  },
  definitions: {
    Book: {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "9780743273565",
      genre: "Fiction",
      publishedYear: 1925,
      availableCopies: 3,
      totalCopies: 5,
      description: "A classic American novel set in the Jazz Age",
      publisher: "Scribner",
      language: "English",
      pageCount: 180,
    },
    Member: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@email.com",
      phone: "+1234567890",
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zipCode: "12345",
      },
      membershipType: "Basic",
      isActive: true,
      fines: 0,
    },
    ApiResponse: {
      success: true,
      message: "Operation completed successfully",
      data: {},
    },
    ErrorResponse: {
      success: false,
      message: "Error message",
      error: "Detailed error information",
    },
  },
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./routes/index.js"];

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger documentation generated successfully!");
});
