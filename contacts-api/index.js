const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  ssl: true,
  sslValidate: true,
});
let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    console.log("MongoDB client connected successfully");

    // Test the connection
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB ping successful");

    db = client.db("contacts"); // Database name
    app.locals.db = db; // Store db in app locals for routes to access
    console.log("Connected to MongoDB database: contacts");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    console.error(
      "MongoDB URI (masked):",
      process.env.MONGODB_URI
        ? process.env.MONGODB_URI.replace(/\/\/.*@/, "//*****@")
        : "undefined"
    );
    throw error; // Re-throw to prevent server from starting
  }
}

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Contacts API" });
});

// Import and use contacts routes
const contactsRoutes = require("./routes/contacts");
console.log("Contacts routes loaded successfully");
app.use("/contacts", contactsRoutes);

// Test route to verify routing works
app.get("/test", (req, res) => {
  console.log("Test route called");
  res.json({ message: "Test route works" });
});

// Start server only after database connection
async function startServer() {
  try {
    await connectToMongo();
    app.listen(port, () => {
      console.log(`Server starting on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(
      "Failed to start server due to database connection error:",
      error
    );
    process.exit(1);
  }
}

startServer();
