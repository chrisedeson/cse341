const { Member, Book } = require("../models");
const { validationResult } = require("express-validator");

// Get all members
const getAllMembers = async (req, res) => {
  try {
    let { page = 1, limit = 10, membershipType, isActive } = req.query;

    // Validate and convert pagination parameters
    page = parseInt(page);
    limit = parseInt(limit);

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid page parameter. Page must be a positive integer.",
        received: req.query.page,
      });
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid limit parameter. Limit must be a positive integer between 1 and 100.",
        received: req.query.limit,
      });
    }

    const query = {};

    // Filter by membership type
    if (membershipType) {
      query.membershipType = membershipType;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const members = await Member.find(query)
      .populate("borrowedBooks.bookId", "title author isbn")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Member.countDocuments(query);

    res.status(200).json({
      success: true,
      data: members,
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
      message: "Error retrieving members",
      error: error.message,
    });
  }
};

// Get member by ID
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate(
      "borrowedBooks.bookId",
      "title author isbn genre"
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving member",
      error: error.message,
    });
  }
};

// Create new member
const createMember = async (req, res) => {
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

    const member = new Member(req.body);
    const savedMember = await member.save();

    res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: savedMember,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Member with this email already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error creating member",
        error: error.message,
      });
    }
  }
};

// Update member
const updateMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("borrowedBooks.bookId", "title author isbn");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: member,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Member with this email already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error updating member",
        error: error.message,
      });
    }
  }
};

// Delete member
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Check if member has unreturned books
    const unreturnedBooks = member.borrowedBooks.filter(
      (book) => !book.isReturned
    );
    if (unreturnedBooks.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete member with unreturned books",
        unreturnedBooks: unreturnedBooks.length,
      });
    }

    await Member.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Member deleted successfully",
      data: member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting member",
      error: error.message,
    });
  }
};

// Borrow book
const borrowBook = async (req, res) => {
  try {
    const { memberId, bookId } = req.params;

    const member = await Member.findById(memberId);
    const book = await Book.findById(bookId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: "No copies available for borrowing",
      });
    }

    // Check if member already has this book
    const alreadyBorrowed = member.borrowedBooks.some(
      (borrowedBook) =>
        borrowedBook.bookId.toString() === bookId && !borrowedBook.isReturned
    );

    if (alreadyBorrowed) {
      return res.status(400).json({
        success: false,
        message: "Member has already borrowed this book",
      });
    }

    // Add book to member's borrowed books
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

    member.borrowedBooks.push({
      bookId,
      borrowDate,
      dueDate,
    });

    // Decrease available copies
    book.availableCopies -= 1;

    await member.save();
    await book.save();

    res.status(200).json({
      success: true,
      message: "Book borrowed successfully",
      data: {
        member: member.fullName,
        book: book.title,
        dueDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error borrowing book",
      error: error.message,
    });
  }
};

// Return book
const returnBook = async (req, res) => {
  try {
    const { memberId, bookId } = req.params;

    const member = await Member.findById(memberId);
    const book = await Book.findById(bookId);

    if (!member || !book) {
      return res.status(404).json({
        success: false,
        message: "Member or book not found",
      });
    }

    // Find the borrowed book record
    const borrowedBookIndex = member.borrowedBooks.findIndex(
      (borrowedBook) =>
        borrowedBook.bookId.toString() === bookId && !borrowedBook.isReturned
    );

    if (borrowedBookIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Book was not borrowed by this member or already returned",
      });
    }

    // Mark book as returned
    member.borrowedBooks[borrowedBookIndex].returnDate = new Date();
    member.borrowedBooks[borrowedBookIndex].isReturned = true;

    // Increase available copies
    book.availableCopies += 1;

    await member.save();
    await book.save();

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: {
        member: member.fullName,
        book: book.title,
        returnDate: member.borrowedBooks[borrowedBookIndex].returnDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error returning book",
      error: error.message,
    });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  borrowBook,
  returnBook,
};
