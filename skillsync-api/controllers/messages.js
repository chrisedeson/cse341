const Message = require('../models/Message');

// @desc    Get all messages (inbox/sent)
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { type = 'inbox', isRead, isArchived, page = 1, limit = 50 } = req.query;

    let messages;

    if (type === 'inbox') {
      messages = await Message.getInbox(req.user._id, {
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        isArchived: isArchived === 'true',
        limit: parseInt(limit),
        page: parseInt(page)
      });
    } else if (type === 'sent') {
      messages = await Message.getSentMessages(req.user._id, {
        limit: parseInt(limit),
        page: parseInt(page)
      });
    }

    const total = type === 'inbox' 
      ? await Message.countDocuments({ recipient: req.user._id, isArchived: isArchived === 'true' })
      : await Message.countDocuments({ sender: req.user._id });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// @desc    Get single message by ID
// @route   GET /api/messages/:id
// @access  Private
exports.getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .populate('project', 'title');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or recipient
    if (
      message.sender._id.toString() !== req.user._id.toString() &&
      message.recipient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this message'
      });
    }

    // Mark as read if recipient is viewing
    if (message.recipient._id.toString() === req.user._id.toString() && !message.isRead) {
      await message.markAsRead();
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching message',
      error: error.message
    });
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
exports.createMessage = async (req, res) => {
  try {
    // Set sender to authenticated user
    req.body.sender = req.user._id;

    // Check if trying to send to self
    if (req.body.recipient === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    const message = await Message.create(req.body);

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .populate('project', 'title');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// @desc    Update message (mark as read, archive, flag, etc.)
// @route   PUT /api/messages/:id
// @access  Private
exports.updateMessage = async (req, res) => {
  try {
    let message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only recipient can update message status
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this message'
      });
    }

    // Handle specific actions
    if (req.body.action === 'markRead') {
      await message.markAsRead();
    } else if (req.body.action === 'archive') {
      await message.archive();
    } else if (req.body.action === 'toggleFlag') {
      await message.toggleFlag();
    } else {
      // General update
      message = await Message.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('sender', 'name email avatar')
       .populate('recipient', 'name email avatar');
    }

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating message',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender or recipient can delete
    if (
      message.sender.toString() !== req.user._id.toString() &&
      message.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.getConversation(
      req.user._id,
      req.params.userId,
      {
        limit: parseInt(limit),
        page: parseInt(page)
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countUnread(req.user._id);

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};
