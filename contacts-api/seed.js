const { MongoClient } = require("mongodb");
require("dotenv").config();

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("contacts");
    const collection = db.collection("contacts");

    // Sample contacts data with required fields
    const contacts = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        favoriteColor: "Blue",
        birthday: "1990-05-15",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@email.com",
        favoriteColor: "Green",
        birthday: "1985-08-22",
      },
      {
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob.johnson@email.com",
        favoriteColor: "Red",
        birthday: "1992-12-03",
      },
    ];

    // Clear existing data and insert new data
    await collection.deleteMany({});
    const result = await collection.insertMany(contacts);

    console.log(`${result.insertedCount} contacts inserted successfully`);
    console.log("Sample contact data seeded!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedDatabase();
