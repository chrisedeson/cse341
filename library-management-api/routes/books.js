const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const bookController = require("../controllers/bookController");

// Query parameter validation for GET routes
const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be a positive integer between 1 and 100")
    .toInt(),
];

// Validation middleware for book creation/update
const bookValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("author")
    .notEmpty()
    .withMessage("Author is required")
    .isLength({ max: 100 })
    .withMessage("Author name cannot exceed 100 characters"),
  body("isbn")
    .notEmpty()
    .withMessage("ISBN is required")
    .matches(/^(?:\d{9}X|\d{10}|\d{13})$/)
    .withMessage("Please enter a valid ISBN"),
  body("genre")
    .notEmpty()
    .withMessage("Genre is required")
    .isIn([
      "Fiction",
      "Non-Fiction",
      "Mystery",
      "Romance",
      "Sci-Fi",
      "Fantasy",
      "Biography",
      "History",
      "Science",
      "Technology",
      "Self-Help",
      "Other",
    ])
    .withMessage("Invalid genre"),
  body("publishedYear")
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage("Please enter a valid year"),
  body("totalCopies")
    .isInt({ min: 1 })
    .withMessage("Total copies must be at least 1"),
  body("availableCopies")
    .isInt({ min: 0 })
    .withMessage("Available copies cannot be negative"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
];

// Routes
router.get("/", paginationValidation, bookController.getAllBooks);
router.get("/genre/:genre", bookController.getBooksByGenre);
router.get("/:id", bookController.getBookById);
router.post("/", bookValidation, bookController.createBook);
router.put("/:id", bookValidation, bookController.updateBook);
router.delete("/:id", bookController.deleteBook);

module.exports = router;
