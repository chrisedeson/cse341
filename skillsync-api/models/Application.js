const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant is required']
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  proposedRole: {
    type: String,
    required: [true, 'Proposed role is required'],
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  skillsOffered: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    }
  }],
  availability: {
    hoursPerWeek: {
      type: Number,
      required: [true, 'Hours per week is required'],
      min: [1, 'Hours per week must be at least 1'],
      max: [168, 'Hours per week cannot exceed 168']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date
    }
  },
  expectedCompensation: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      default: 'USD'
    },
    type: {
      type: String,
      enum: ['hourly', 'fixed', 'volunteer'],
      default: 'hourly'
    }
  },
  portfolio: [{
    title: {
      type: String,
      maxlength: [100, 'Portfolio title cannot exceed 100 characters']
    },
    url: {
      type: String,
      maxlength: [500, 'URL cannot exceed 500 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'under-review', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters']
  },
  questions: [{
    question: {
      type: String,
      maxlength: [500, 'Question cannot exceed 500 characters']
    },
    answer: {
      type: String,
      maxlength: [1000, 'Answer cannot exceed 1000 characters']
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
applicationSchema.index({ project: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ status: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ project: 1 });
applicationSchema.index({ createdAt: -1 });

// Virtual for application age in days
applicationSchema.virtual('daysOld').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to update application status
applicationSchema.methods.updateStatus = function(status, reviewerId, notes) {
  this.status = status;
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (notes) this.reviewNotes = notes;
  return this.save();
};

// Static method to get applications by project
applicationSchema.statics.findByProject = function(projectId, options = {}) {
  const { status, limit = 20 } = options;

  let query = { project: projectId };
  
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('applicant', 'name email avatar skills experienceLevel')
    .populate('project', 'title status')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get user's applications
applicationSchema.statics.findByApplicant = function(applicantId, options = {}) {
  const { status, limit = 20 } = options;

  let query = { applicant: applicantId };
  
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('project', 'title description status owner')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Application', applicationSchema);
