const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const port = 8080;

// MongoDB connection
const uri =
  "mongodb+srv://edesonchristopher_db_user:3WbPxBTgaGJwC6ix@cluster0.skp8rck.mongodb.net/"; // Replace YOUR_PASSWORD with your actual password
const client = new MongoClient(uri);
const dbName = "cse341";
let db;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Sample data to insert if collection is empty
const professionalData = {
  professionalName: "John Doe",
  base64Image:
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // 1x1 transparent PNG
  nameLink: {
    firstName: "John",
    url: "https://example.com",
  },
  primaryDescription: " - Software Developer",
  workDescription1:
    "Passionate about creating innovative web applications and solving complex problems with code.",
  workDescription2:
    "Experienced in full-stack development using modern technologies like Node.js, React, and MongoDB.",
  linkTitleText: "Connect with me:",
  linkedInLink: {
    text: "LinkedIn",
    link: "https://linkedin.com/in/johndoe",
  },
  githubLink: {
    text: "GitHub",
    link: "https://github.com/johndoe",
  },
  contactText: "Feel free to reach out for collaborations or opportunities.",
};

// Routes
app.get("/professional", async (req, res) => {
  try {
    const collection = db.collection("professionals");
    const data = await collection.findOne({});
    if (data) {
      res.json(data);
    } else {
      // Insert sample data if none exists
      await collection.insertOne(professionalData);
      res.json(professionalData);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(port, async () => {
  await connectToMongo();
  console.log(`Server running on http://localhost:${port}`);
});
