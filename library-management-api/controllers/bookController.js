const { Book } = require("../models");
const { validationResult } = require("express-validator");

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, author, search } = req.query;
    const query = {};

    // Filter by genre
    if (genre) {
      query.genre = genre;
    }

    // Filter by author
    if (author) {
      query.author = new RegExp(author, "i");
    }

    // Text search across title, author, and description
    if (search) {
      query.$text = { $search: search };
    }

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving books",
      error: error.message,
    });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving book",
      error: error.message,
    });
  }
};

// Create new book
const createBook = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const bookData = req.body;

    // Ensure available copies doesn't exceed total copies
    if (bookData.availableCopies > bookData.totalCopies) {
      bookData.availableCopies = bookData.totalCopies;
    }

    const book = new Book(bookData);
    const savedBook = await book.save();

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: savedBook,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error creating book",
        error: error.message,
      });
    }
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const bookData = req.body;

    // Ensure available copies doesn't exceed total copies
    if (bookData.availableCopies > bookData.totalCopies) {
      bookData.availableCopies = bookData.totalCopies;
    }

    const book = await Book.findByIdAndUpdate(req.params.id, bookData, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error updating book",
        error: error.message,
      });
    }
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting book",
      error: error.message,
    });
  }
};

// Get books by genre
const getBooksByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const books = await Book.find({ genre }).sort({ title: 1 });

    res.status(200).json({
      success: true,
      data: books,
      count: books.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving books by genre",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByGenre,
};
