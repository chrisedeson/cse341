const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          "https://library-management-api-ca0s.onrender.com",
          "https://*.onrender.com",
        ]
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation with dynamic configuration
let swaggerDocument;
try {
  swaggerDocument = require("./swagger.json");
  // Update host in production
  if (
    process.env.NODE_ENV === "production" &&
    process.env.RENDER_EXTERNAL_URL
  ) {
    swaggerDocument.host = process.env.RENDER_EXTERNAL_URL.replace(
      "https://",
      ""
    ).replace("http://", "");
    swaggerDocument.schemes = ["https"];
  }
} catch (error) {
  console.warn(
    "Swagger documentation not found. Generate it with: npm run swagger"
  );
  swaggerDocument = {
    swagger: "2.0",
    info: { title: "Library Management API", version: "1.0.0" },
    paths: {},
  };
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api", require("./routes"));

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Library Management API",
    documentation: "/api-docs",
    endpoints: {
      books: "/api/books",
      members: "/api/members",
    },
  });
});

// MongoDB connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    availableRoutes: ["/api/books", "/api/members", "/api-docs"],
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`
  );
});

module.exports = app;
