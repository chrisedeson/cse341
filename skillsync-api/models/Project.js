const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required']
  },
  status: {
    type: String,
    enum: ['planning', 'open', 'in-progress', 'completed', 'cancelled'],
    default: 'planning'
  },
  category: {
    type: String,
    enum: ['web-development', 'mobile-development', 'data-science', 'machine-learning', 'devops', 'blockchain', 'game-development', 'other'],
    required: [true, 'Project category is required']
  },
  requiredSkills: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true,
      maxlength: [50, 'Role cannot be more than 50 characters']
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'removed'],
      default: 'active'
    }
  }],
  maxTeamSize: {
    type: Number,
    min: 1,
    max: 20,
    default: 5
  },
  budget: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      default: 'USD'
    }
  },
  timeline: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    estimatedDuration: {
      type: Number, // in weeks
      min: 1,
      max: 52
    }
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  technologies: [{
    type: String,
    maxlength: [30, 'Technology name cannot be more than 30 characters']
  }],
  repositoryUrl: {
    type: String,
    validate: {
      validator: function(url) {
        return !url || /^https?:\/\/.+/.test(url);
      },
      message: 'Repository URL must be a valid HTTP/HTTPS URL'
    }
  },
  projectUrl: {
    type: String,
    validate: {
      validator: function(url) {
        return !url || /^https?:\/\/.+/.test(url);
      },
      message: 'Project URL must be a valid HTTP/HTTPS URL'
    }
  },
  tags: [{
    type: String,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  isRemote: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    default: ''
  },
  timezone: {
    type: String,
    default: ''
  },
  communication: {
    platform: {
      type: String,
      enum: ['slack', 'discord', 'microsoft-teams', 'zoom', 'google-meet', 'skype', 'email', 'other'],
      default: 'email'
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'as-needed'],
      default: 'weekly'
    }
  },
  requirements: {
    type: String,
    maxlength: [1000, 'Requirements cannot be more than 1000 characters']
  },
  benefits: {
    type: String,
    maxlength: [500, 'Benefits cannot be more than 500 characters']
  },
  views: {
    type: Number,
    default: 0
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ 'requiredSkills.name': 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ featured: -1, createdAt: -1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ tags: 1 });

// Virtual for current team size
projectSchema.virtual('currentTeamSize').get(function() {
  return this.teamMembers.filter(member => member.status === 'active').length;
});

// Virtual for available spots
projectSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.maxTeamSize - this.currentTeamSize);
});

// Virtual for project duration in days
projectSchema.virtual('durationInDays').get(function() {
  if (this.timeline.startDate && this.timeline.endDate) {
    return Math.ceil((this.timeline.endDate - this.timeline.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for project progress (if dates are set)
projectSchema.virtual('progress').get(function() {
  if (!this.timeline.startDate || !this.timeline.endDate) return 0;

  const now = new Date();
  const start = this.timeline.startDate;
  const end = this.timeline.endDate;

  if (now < start) return 0;
  if (now > end) return 100;

  const totalDuration = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / totalDuration) * 100);
});

// Pre-save middleware to set shortDescription if not provided
projectSchema.pre('save', function(next) {
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 197) + (this.description.length > 197 ? '...' : '');
  }
  next();
});

// Static method to find projects by skills
projectSchema.statics.findByRequiredSkills = function(skills, options = {}) {
  const { status = 'open', limit = 10, category } = options;

  let query = {
    'requiredSkills.name': { $in: skills },
    status
  };

  if (category) {
    query.category = category;
  }

  return this.find(query)
    .populate('owner', 'name email avatar')
    .select('title shortDescription category requiredSkills status createdAt difficulty technologies tags')
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to find featured projects
projectSchema.statics.findFeatured = function(limit = 6) {
  return this.find({ featured: true, status: 'open' })
    .populate('owner', 'name email avatar')
    .select('title shortDescription category requiredSkills status createdAt difficulty technologies tags')
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Instance method to add team member
projectSchema.methods.addTeamMember = function(userId, role) {
  // Check if user is already a team member
  const existingMember = this.teamMembers.find(member =>
    member.user.toString() === userId.toString() && member.status === 'active'
  );

  if (existingMember) {
    throw new Error('User is already a team member');
  }

  // Check if project is at max capacity
  if (this.currentTeamSize >= this.maxTeamSize) {
    throw new Error('Project is at maximum team size');
  }

  this.teamMembers.push({
    user: userId,
    role: role,
    joinedAt: new Date(),
    status: 'active'
  });

  return this.save();
};

// Instance method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  const memberIndex = this.teamMembers.findIndex(member =>
    member.user.toString() === userId.toString() && member.status === 'active'
  );

  if (memberIndex === -1) {
    throw new Error('User is not an active team member');
  }

  this.teamMembers[memberIndex].status = 'removed';
  return this.save();
};

// Instance method to increment views
projectSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Project', projectSchema);