const Application = require('../models/Application');
const Project = require('../models/Project');

// @desc    Get all applications with pagination and filters
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res) => {
  try {
    const { status, project, applicant, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) query.status = status;
    if (project) query.project = project;
    if (applicant) query.applicant = applicant;

    const applications = await Application.find(query)
      .populate('project', 'title description status')
      .populate('applicant', 'name email avatar skills experienceLevel')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('project', 'title description status owner')
      .populate('applicant', 'name email avatar skills experienceLevel bio')
      .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
  try {
    // Add applicant from authenticated user
    req.body.applicant = req.user._id;

    // Check if project exists
    const project = await Project.findById(req.body.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      project: req.body.project,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this project'
      });
    }

    const application = await Application.create(req.body);

    const populatedApplication = await Application.findById(application._id)
      .populate('project', 'title')
      .populate('applicant', 'name email');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populatedApplication
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating application',
      error: error.message
    });
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = async (req, res) => {
  try {
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Only applicant can update their application (unless updating status)
    if (application.applicant.toString() !== req.user._id.toString() && !req.body.status) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // If updating status, must be project owner
    if (req.body.status) {
      const project = await Project.findById(application.project);
      if (project.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only project owner can update application status'
        });
      }

      if (req.body.status !== 'pending') {
        req.body.reviewedBy = req.user._id;
        req.body.reviewedAt = Date.now();
      }
    }

    application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('project', 'title')
      .populate('applicant', 'name email');

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Only applicant can delete their application
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application'
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message
    });
  }
};

// @desc    Get applications for a specific project
// @route   GET /api/applications/project/:projectId
// @access  Private
exports.getProjectApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const applications = await Application.findByProject(req.params.projectId, {
      status,
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project applications',
      error: error.message
    });
  }
};

// @desc    Get current user's applications
// @route   GET /api/applications/my/applications
// @access  Private
exports.getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const applications = await Application.findByApplicant(req.user._id, {
      status,
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your applications',
      error: error.message
    });
  }
};
