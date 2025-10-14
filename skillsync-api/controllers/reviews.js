const Review = require('../models/Review');
const Project = require('../models/Project');

// @desc    Get all reviews with pagination and filters
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { reviewee, project, isPublic = true, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic };

    if (reviewee) query.reviewee = reviewee;
    if (project) query.project = project;

    const reviews = await Review.find(query)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Get single review by ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewer', 'name avatar email')
      .populate('reviewee', 'name avatar email')
      .populate('project', 'title description');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only show public reviews or if user is reviewer/reviewee
    if (!review.isPublic && req.user) {
      if (
        review.reviewer._id.toString() !== req.user._id.toString() &&
        review.reviewee._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'This review is private'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    // Set reviewer to authenticated user
    req.body.reviewer = req.user._id;

    // Check if project exists
    const project = await Project.findById(req.body.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user was part of the project
    const wasTeamMember = project.teamMembers.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!wasTeamMember && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You must have been part of the project to leave a review'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      project: req.body.project,
      reviewer: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this project'
      });
    }

    // Cannot review yourself
    if (req.body.reviewee === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot review yourself'
      });
    }

    const review = await Review.create(req.body);

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .populate('project', 'title');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only reviewer can update their review
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Cannot change reviewer, reviewee, or project
    delete req.body.reviewer;
    delete req.body.reviewee;
    delete req.body.project;

    review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .populate('project', 'title');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only reviewer can delete their review
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const reviews = await Review.findByReviewee(req.params.userId, {
      limit: parseInt(limit),
      page: parseInt(page)
    });

    const stats = await Review.calculateAverage(req.params.userId);

    res.status(200).json({
      success: true,
      count: reviews.length,
      stats,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user reviews',
      error: error.message
    });
  }
};

// @desc    Get reviews for a project
// @route   GET /api/reviews/project/:projectId
// @access  Public
exports.getProjectReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const reviews = await Review.findByProject(req.params.projectId, {
      limit: parseInt(limit),
      page: parseInt(page)
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project reviews',
      error: error.message
    });
  }
};

// @desc    Add response to review
// @route   POST /api/reviews/:id/response
// @access  Private
exports.addResponse = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only reviewee can respond
    if (review.reviewee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the reviewee can respond to this review'
      });
    }

    await review.addResponse(req.body.content);

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding response',
      error: error.message
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.markHelpful();

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking review as helpful',
      error: error.message
    });
  }
};
