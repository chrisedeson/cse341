const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: function() {
      return !this.githubId; // Password required only if not using GitHub OAuth
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  githubId: {
    type: String,
    sparse: true // Allows multiple null values but unique non-null values
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  skills: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  experienceLevel: {
    type: String,
    enum: ['junior', 'mid', 'senior', 'lead', 'principal'],
    default: 'junior'
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preferredProjectTypes: [{
    type: String,
    enum: ['web-development', 'mobile-development', 'data-science', 'machine-learning', 'devops', 'blockchain', 'game-development', 'other']
  }],
  hourlyRate: {
    type: Number,
    min: 0
  },
  timezone: {
    type: String,
    default: ''
  },
  languages: [{
    type: String,
    enum: ['english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'korean', 'portuguese', 'italian', 'russian', 'arabic', 'hindi', 'other']
  }],
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ skills: 1 });
userSchema.index({ experienceLevel: 1 });
userSchema.index({ isAvailable: 1 });
userSchema.index({ 'skills.name': 1 });

// Virtual for user's full profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  let completed = 0;
  const total = 8; // Total required fields for 100% completion

  if (this.name) completed++;
  if (this.email) completed++;
  if (this.bio) completed++;
  if (this.skills && this.skills.length > 0) completed++;
  if (this.experienceLevel) completed++;
  if (this.location) completed++;
  if (this.preferredProjectTypes && this.preferredProjectTypes.length > 0) completed++;
  if (this.languages && this.languages.length > 0) completed++;

  return Math.round((completed / total) * 100);
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Static method to find users by skills
userSchema.statics.findBySkills = function(skills, options = {}) {
  const { experienceLevel, isAvailable = true, limit = 10 } = options;

  let query = {
    'skills.name': { $in: skills },
    isAvailable
  };

  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  return this.find(query)
    .select('name email skills experienceLevel avatar bio location')
    .limit(limit)
    .sort({ lastActive: -1 });
};

module.exports = mongoose.model('User', userSchema);