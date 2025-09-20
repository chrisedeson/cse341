const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
      match: [/^(?:\d{9}X|\d{10}|\d{13})$/, "Please enter a valid ISBN"],
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      enum: [
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
      ],
      default: "Other",
    },
    publishedYear: {
      type: Number,
      required: [true, "Published year is required"],
      min: [1000, "Please enter a valid year"],
      max: [new Date().getFullYear(), "Published year cannot be in the future"],
    },
    availableCopies: {
      type: Number,
      required: [true, "Available copies count is required"],
      min: [0, "Available copies cannot be negative"],
      default: 0,
    },
    totalCopies: {
      type: Number,
      required: [true, "Total copies count is required"],
      min: [1, "Total copies must be at least 1"],
      default: 1,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, "Publisher name cannot exceed 100 characters"],
    },
    language: {
      type: String,
      default: "English",
      trim: true,
    },
    pageCount: {
      type: Number,
      min: [1, "Page count must be at least 1"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for borrowed copies
bookSchema.virtual("borrowedCopies").get(function () {
  return this.totalCopies - this.availableCopies;
});

// Ensure available copies never exceed total copies
bookSchema.pre("save", function (next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

// Index for better search performance
bookSchema.index({ title: "text", author: "text", description: "text" });
bookSchema.index({ genre: 1 });
bookSchema.index({ author: 1 });

module.exports = mongoose.model("Book", bookSchema);
