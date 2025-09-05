const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const router = express.Router();

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// GET /contacts - Get all contacts
router.get('/', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('contacts');
    const collection = db.collection('contacts');

    const contacts = await collection.find({}).toArray();
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// GET /contacts/:id - Get a single contact by ID
router.get('/:id', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('contacts');
    const collection = db.collection('contacts');

    const contactId = req.params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(contactId)) {
      return res.status(400).json({ error: 'Invalid contact ID format' });
    }

    const contact = await collection.findOne({ _id: new ObjectId(contactId) });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

module.exports = router;
