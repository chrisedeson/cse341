const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects (with filters and pagination)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.owner) {
      filter.owner = req.user._id; // Only show user's own projects
    }

    if (req.query.skills) {
      const skills = Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills];
      filter['requiredSkills.name'] = { $in: skills };
    }

    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }

    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
        { technologies: new RegExp(req.query.search, 'i') },
        { tags: new RegExp(req.query.search, 'i') }
      ];
    }

    // Get projects with populated owner info
    const projects = await Project.find(filter)
      .populate('owner', 'name email avatar')
      .populate('teamMembers.user', 'name email avatar')
      .select('-applications') // Exclude applications for performance
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Project.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar bio')
      .populate('teamMembers.user', 'name email avatar')
      .populate('applications', 'user status createdAt');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Increment view count (but don't wait for it)
    project.incrementViews().catch(err => console.error('View increment error:', err));

    res.status(200).json({
      success: true,
      data: {
        project,
        currentTeamSize: project.currentTeamSize,
        availableSpots: project.availableSpots,
        progress: project.progress,
        durationInDays: project.durationInDays
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    // Add owner to the project data
    const projectData = {
      ...req.body,
      owner: req.user._id
    };

    const project = await Project.create(projectData);

    // Populate owner information
    await project.populate('owner', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project,
        currentTeamSize: project.currentTeamSize,
        availableSpots: project.availableSpots
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (owner only)
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Update project
    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatar')
     .populate('teamMembers.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project,
        currentTeamSize: project.currentTeamSize,
        availableSpots: project.availableSpots
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (owner only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    // Soft delete by changing status to cancelled
    project.status = 'cancelled';
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project cancelled successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add team member to project
// @route   POST /api/projects/:id/team
// @access  Private (owner only)
const addTeamMember = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this project'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add team member
    await project.addTeamMember(userId, role);

    // Populate the updated project
    await project.populate('teamMembers.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Team member added successfully',
      data: {
        project,
        currentTeamSize: project.currentTeamSize,
        availableSpots: project.availableSpots
      }
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Remove team member from project
// @route   DELETE /api/projects/:id/team/:userId
// @access  Private (owner only)
const removeTeamMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this project'
      });
    }

    // Remove team member
    await project.removeTeamMember(req.params.userId);

    // Populate the updated project
    await project.populate('teamMembers.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
      data: {
        project,
        currentTeamSize: project.currentTeamSize,
        availableSpots: project.availableSpots
      }
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error removing team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Search projects by required skills
// @route   GET /api/projects/search/skills
// @access  Private
const searchBySkills = async (req, res) => {
  try {
    const { skills, status = 'open', limit = 10, category } = req.query;

    if (!skills || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skills parameter is required'
      });
    }

    const skillArray = Array.isArray(skills) ? skills : [skills];

    const projects = await Project.findByRequiredSkills(skillArray, {
      status,
      limit: parseInt(limit),
      category
    });

    res.status(200).json({
      success: true,
      data: {
        projects,
        count: projects.length
      }
    });
  } catch (error) {
    console.error('Search by skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get featured projects
// @route   GET /api/projects/featured
// @access  Public
const getFeaturedProjects = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const projects = await Project.findFeatured(limit);

    res.status(200).json({
      success: true,
      data: {
        projects,
        count: projects.length
      }
    });
  } catch (error) {
    console.error('Get featured projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving featured projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private
const getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const projectsByStatus = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const projectsByCategory = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const topTechnologies = await Project.aggregate([
      { $unwind: '$technologies' },
      { $group: { _id: '$technologies', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        projectsByStatus,
        projectsByCategory,
        topTechnologies
      }
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's projects
// @route   GET /api/projects/my-projects
// @access  Private
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .populate('teamMembers.user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        projects,
        count: projects.length
      }
    });
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving your projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  searchBySkills,
  getFeaturedProjects,
  getProjectStats,
  getMyProjects
};