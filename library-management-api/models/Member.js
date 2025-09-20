const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [100, "Street cannot exceed 100 characters"],
      },
      city: {
        type: String,
        trim: true,
        maxlength: [50, "City cannot exceed 50 characters"],
      },
      state: {
        type: String,
        trim: true,
        maxlength: [50, "State cannot exceed 50 characters"],
      },
      zipCode: {
        type: String,
        trim: true,
        match: [/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"],
      },
    },
    membershipDate: {
      type: Date,
      default: Date.now,
      required: [true, "Membership date is required"],
    },
    membershipType: {
      type: String,
      enum: ["Basic", "Premium", "Student", "Senior"],
      default: "Basic",
      required: [true, "Membership type is required"],
    },
    borrowedBooks: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        borrowDate: {
          type: Date,
          default: Date.now,
          required: true,
        },
        dueDate: {
          type: Date,
          required: true,
        },
        returnDate: {
          type: Date,
        },
        isReturned: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    fines: {
      type: Number,
      default: 0,
      min: [0, "Fines cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
memberSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for current borrowed books count
memberSchema.virtual("currentBorrowedCount").get(function () {
  return this.borrowedBooks.filter((book) => !book.isReturned).length;
});

// Virtual for overdue books
memberSchema.virtual("overdueBooks").get(function () {
  const now = new Date();
  return this.borrowedBooks.filter(
    (book) => !book.isReturned && book.dueDate < now
  );
});

// Index for better search performance
memberSchema.index({ email: 1 });
memberSchema.index({ firstName: 1, lastName: 1 });
memberSchema.index({ membershipType: 1 });

// Pre-save middleware to set due dates (14 days from borrow date)
memberSchema.pre("save", function (next) {
  this.borrowedBooks.forEach((book) => {
    if (!book.dueDate && book.borrowDate) {
      const dueDate = new Date(book.borrowDate);
      dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period
      book.dueDate = dueDate;
    }
  });
  next();
});

module.exports = mongoose.model("Member", memberSchema);
