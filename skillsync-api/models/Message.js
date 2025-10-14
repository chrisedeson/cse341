const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    maxlength: [200, 'Subject cannot exceed 200 characters'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [5000, 'Message content cannot exceed 5000 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  attachments: [{
    filename: {
      type: String,
      maxlength: [255, 'Filename cannot exceed 255 characters']
    },
    url: {
      type: String,
      maxlength: [1000, 'URL cannot exceed 1000 characters']
    },
    fileType: {
      type: String,
      enum: ['image', 'document', 'code', 'other'],
      default: 'other'
    },
    fileSize: {
      type: Number, // in bytes
      max: [10485760, 'File size cannot exceed 10MB'] // 10MB limit
    }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  category: {
    type: String,
    enum: ['general', 'project-inquiry', 'collaboration', 'feedback', 'support', 'other'],
    default: 'general'
  },
  inReplyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ project: 1 });
messageSchema.index({ isArchived: 1 });
messageSchema.index({ category: 1 });

// Virtual for message age
messageSchema.virtual('messageAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
  return `${Math.floor(diffMinutes / 1440)} days ago`;
});

// Virtual for has attachments
messageSchema.virtual('hasAttachments').get(function() {
  return this.attachments && this.attachments.length > 0;
});

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to archive message
messageSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Method to flag/unflag message
messageSchema.methods.toggleFlag = function() {
  this.isFlagged = !this.isFlagged;
  return this.save();
};

// Static method to get user's inbox
messageSchema.statics.getInbox = function(userId, options = {}) {
  const { isRead, isArchived = false, limit = 50, page = 1 } = options;

  let query = {
    recipient: userId,
    isArchived
  };

  if (typeof isRead === 'boolean') {
    query.isRead = isRead;
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('sender', 'name email avatar')
    .populate('project', 'title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get user's sent messages
messageSchema.statics.getSentMessages = function(userId, options = {}) {
  const { limit = 50, page = 1 } = options;

  const skip = (page - 1) * limit;

  return this.find({ sender: userId })
    .populate('recipient', 'name email avatar')
    .populate('project', 'title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(user1Id, user2Id, options = {}) {
  const { limit = 50, page = 1 } = options;
  
  const skip = (page - 1) * limit;

  return this.find({
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id }
    ]
  })
    .populate('sender', 'name email avatar')
    .populate('recipient', 'name email avatar')
    .sort({ createdAt: 1 }) // Chronological order for conversation
    .limit(limit)
    .skip(skip);
};

// Static method to count unread messages
messageSchema.statics.countUnread = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isArchived: false
  });
};

module.exports = mongoose.model('Message', messageSchema);
