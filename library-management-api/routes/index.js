const express = require("express");
const router = express.Router();

// Import route modules
const bookRoutes = require("./books");
const memberRoutes = require("./members");

// Use routes
router.use("/books", bookRoutes);
router.use("/members", memberRoutes);

// API info route
router.get("/", (req, res) => {
  res.json({
    message: "Library Management API",
    version: "1.0.0",
    endpoints: {
      books: "/api/books",
      members: "/api/members",
      documentation: "/api-docs",
    },
    features: [
      "Book management (CRUD)",
      "Member management (CRUD)",
      "Book borrowing and returning",
      "Search and filtering",
      "Input validation",
      "Comprehensive error handling",
    ],
  });
});

module.exports = router;
