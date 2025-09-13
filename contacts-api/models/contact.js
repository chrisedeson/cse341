const { ObjectId } = require("mongodb");

class Contact {
  constructor(db) {
    this.collection = db.collection("contacts");
  }

  async findAll() {
    return await this.collection.find({}).toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid contact ID format");
    }
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async create(contactData) {
    const result = await this.collection.insertOne(contactData);
    return result.insertedId;
  }

  async update(id, updateData) {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid contact ID format");
    }
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return result;
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid contact ID format");
    }
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

module.exports = Contact;
