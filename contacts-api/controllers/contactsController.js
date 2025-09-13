const Contact = require("../models/contact");

class ContactsController {
  constructor(db) {
    this.contactModel = new Contact(db);
  }

  async getAllContacts(req, res) {
    try {
      const contacts = await this.contactModel.findAll();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getContactById(req, res) {
    try {
      const contact = await this.contactModel.findById(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      if (error.message === "Invalid contact ID format") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Error fetching contact:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createContact(req, res) {
    try {
      const { firstName, lastName, email, favoriteColor, birthday } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
        return res
          .status(400)
          .json({
            error:
              "All fields are required: firstName, lastName, email, favoriteColor, birthday",
          });
      }

      const newContact = {
        firstName,
        lastName,
        email,
        favoriteColor,
        birthday,
      };

      const insertedId = await this.contactModel.create(newContact);
      res.status(201).json({ id: insertedId });
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateContact(req, res) {
    try {
      const { firstName, lastName, email, favoriteColor, birthday } = req.body;

      // Validate at least one field is provided
      if (!firstName && !lastName && !email && !favoriteColor && !birthday) {
        return res
          .status(400)
          .json({ error: "At least one field must be provided for update" });
      }

      const updateFields = {};
      if (firstName) updateFields.firstName = firstName;
      if (lastName) updateFields.lastName = lastName;
      if (email) updateFields.email = email;
      if (favoriteColor) updateFields.favoriteColor = favoriteColor;
      if (birthday) updateFields.birthday = birthday;

      const result = await this.contactModel.update(
        req.params.id,
        updateFields
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Contact not found" });
      }

      res.status(200).json({ message: "Contact updated successfully" });
    } catch (error) {
      if (error.message === "Invalid contact ID format") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Error updating contact:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteContact(req, res) {
    try {
      const result = await this.contactModel.delete(req.params.id);

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Contact not found" });
      }

      res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
      if (error.message === "Invalid contact ID format") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Error deleting contact:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = ContactsController;
