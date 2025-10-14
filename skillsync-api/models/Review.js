const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required']
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    trim: true
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  categories: {
    communication: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    technicalSkills: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    reliability: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    teamwork: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    quality: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    }
  },
  pros: [{
    type: String,
    maxlength: [200, 'Pro cannot exceed 200 characters']
  }],
  cons: [{
    type: String,
    maxlength: [200, 'Con cannot exceed 200 characters']
  }],
  wouldWorkAgain: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  response: {
    content: {
      type: String,
      maxlength: [1000, 'Response cannot exceed 1000 characters']
    },
    respondedAt: {
      type: Date
    }
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  reportedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationNotes: {
    type: String,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
reviewSchema.index({ project: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isPublic: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ project: 1, reviewer: 1 }, { unique: true }); // Prevent duplicate reviews

// Virtual for average category rating
reviewSchema.virtual('avgCategoryRating').get(function() {
  const cats = this.categories;
  if (!cats) return null;
  
  let sum = 0;
  let count = 0;
  
  if (cats.communication) { sum += cats.communication; count++; }
  if (cats.technicalSkills) { sum += cats.technicalSkills; count++; }
  if (cats.reliability) { sum += cats.reliability; count++; }
  if (cats.teamwork) { sum += cats.teamwork; count++; }
  if (cats.quality) { sum += cats.quality; count++; }
  
  return count > 0 ? (sum / count).toFixed(1) : null;
});

// Virtual for review age
reviewSchema.virtual('reviewAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

// Method to add response
reviewSchema.methods.addResponse = function(content) {
  this.response = {
    content,
    respondedAt: new Date()
  };
  return this.save();
};

// Method to mark as helpful
reviewSchema.methods.markHelpful = function() {
  this.helpfulCount += 1;
  return this.save();
};

// Method to report review
reviewSchema.methods.report = function() {
  this.reportedCount += 1;
  return this.save();
};

// Method to verify review
reviewSchema.methods.verify = function() {
  this.isVerified = true;
  return this.save();
};

// Static method to get reviews for a user
reviewSchema.statics.findByReviewee = function(revieweeId, options = {}) {
  const { isPublic = true, limit = 20, page = 1 } = options;

  const skip = (page - 1) * limit;

  return this.find({ reviewee: revieweeId, isPublic })
    .populate('reviewer', 'name avatar')
    .populate('project', 'title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get reviews for a project
reviewSchema.statics.findByProject = function(projectId, options = {}) {
  const { isPublic = true, limit = 20, page = 1 } = options;

  const skip = (page - 1) * limit;

  return this.find({ project: projectId, isPublic })
    .populate('reviewer', 'name avatar')
    .populate('reviewee', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to calculate user's average rating
reviewSchema.statics.calculateAverage = async function(revieweeId) {
  const result = await this.aggregate([
    { $match: { reviewee: mongoose.Types.ObjectId(revieweeId), isPublic: true } },
    { $group: {
      _id: null,
      avgRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 }
    }}
  ]);

  return result.length > 0 ? result[0] : { avgRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);
