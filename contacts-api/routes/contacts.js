const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

// GET /contacts - Get all contacts
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const collection = db.collection('contacts');
    const contacts = await collection.find({}).toArray();
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /contacts/:id - Get a single contact by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

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
  }
});

module.exports = router;
