const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    db = client.db('contacts'); // Database name
    app.locals.db = db; // Store db in app locals for routes to access
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Contacts API' });
});

// Import and use contacts routes
const contactsRoutes = require('./routes/contacts');
app.use('/contacts', contactsRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server starting on http://localhost:${port}`);
  connectToMongo();
});
