const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('experienceLevel')
    .optional()
    .isIn(['junior', 'mid', 'senior', 'lead', 'principal'])
    .withMessage('Invalid experience level'),

  body('skills')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Skills must be an array with maximum 20 items'),

  body('skills.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Skill name must be between 1 and 30 characters'),

  body('skills.*.level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Skill level must be beginner, intermediate, advanced, or expert'),

  body('skills.*.yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),

  body('preferredProjectTypes')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Preferred project types must be an array with maximum 10 items'),

  body('preferredProjectTypes.*')
    .optional()
    .isIn(['web-development', 'mobile-development', 'data-science', 'machine-learning', 'devops', 'blockchain', 'game-development', 'frontend', 'backend', 'fullstack', 'open-source', 'other'])
    .withMessage('Invalid project type'),

  body('hourlyRate')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Hourly rate must be between 0 and 1000'),

  body('languages')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Languages must be an array with maximum 10 items'),

  body('languages.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each language must be between 1 and 30 characters'),

  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('experienceLevel')
    .optional()
    .isIn(['junior', 'mid', 'senior', 'lead', 'principal'])
    .withMessage('Invalid experience level'),

  body('skills')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Skills must be an array with maximum 20 items'),

  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each skill must be between 1 and 30 characters'),

  body('preferredProjectTypes')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Preferred project types must be an array with maximum 10 items'),

  body('preferredProjectTypes.*')
    .optional()
    .isIn(['web-development', 'mobile-development', 'data-science', 'machine-learning', 'devops', 'blockchain', 'game-development', 'frontend', 'backend', 'fullstack', 'open-source', 'other'])
    .withMessage('Invalid project type'),

  body('hourlyRate')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Hourly rate must be between 0 and 1000'),

  body('languages')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Languages must be an array with maximum 10 items'),

  body('languages.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each language must be between 1 and 30 characters'),

  handleValidationErrors
];

// Project validation rules
const validateProjectCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('category')
    .isIn(['web-development', 'mobile-development', 'data-science', 'machine-learning', 'devops', 'blockchain', 'game-development', 'frontend', 'backend', 'fullstack', 'open-source', 'other'])
    .withMessage('Invalid project category'),

  body('requiredSkills')
    .isArray({ min: 1, max: 15 })
    .withMessage('At least one required skill is needed, maximum 15 skills'),

  body('requiredSkills.*.name')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Skill name must be between 1 and 30 characters'),

  body('requiredSkills.*.level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Skill level must be beginner, intermediate, advanced, or expert'),

  body('requiredSkills.*.isRequired')
    .optional()
    .isBoolean()
    .withMessage('isRequired must be a boolean'),

  body('maxTeamSize')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Max team size must be between 1 and 20'),

  body('budget.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum budget must be a positive number'),

  body('budget.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum budget must be a positive number'),

  body('budget.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),

  body('timeline.estimatedDuration')
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage('Estimated duration must be between 1 and 52 weeks'),

  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level'),

  body('technologies')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Technologies must be an array with maximum 20 items'),

  body('technologies.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Technology name must be between 1 and 30 characters'),

  body('tags')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Tag must be between 1 and 20 characters'),

  body('repositoryUrl')
    .optional()
    .isURL()
    .withMessage('Repository URL must be a valid URL'),

  body('projectUrl')
    .optional()
    .isURL()
    .withMessage('Project URL must be a valid URL'),

  body('requirements')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Requirements cannot exceed 1000 characters'),

  body('benefits')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Benefits cannot exceed 500 characters'),

  handleValidationErrors
];

const validateProjectUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('category')
    .optional()
    .isIn(['web-development', 'mobile-development', 'data-science', 'machine-learning', 'devops', 'blockchain', 'game-development', 'frontend', 'backend', 'fullstack', 'open-source', 'other'])
    .withMessage('Invalid project category'),

  body('status')
    .optional()
    .isIn(['planning', 'open', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid project status'),

  body('requiredSkills')
    .optional()
    .isArray({ min: 1, max: 15 })
    .withMessage('At least one required skill is needed, maximum 15 skills'),

  body('requiredSkills.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Skill name must be between 1 and 30 characters'),

  body('requiredSkills.*.level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Skill level must be beginner, intermediate, advanced, or expert'),

  body('requiredSkills.*.isRequired')
    .optional()
    .isBoolean()
    .withMessage('isRequired must be a boolean'),

  body('maxTeamSize')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Max team size must be between 1 and 20'),

  body('budget.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum budget must be a positive number'),

  body('budget.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum budget must be a positive number'),

  body('budget.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),

  body('timeline.estimatedDuration')
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage('Estimated duration must be between 1 and 52 weeks'),

  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level'),

  body('technologies')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Technologies must be an array with maximum 20 items'),

  body('technologies.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Technology name must be between 1 and 30 characters'),

  body('tags')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Tag must be between 1 and 20 characters'),

  body('repositoryUrl')
    .optional()
    .isURL()
    .withMessage('Repository URL must be a valid URL'),

  body('projectUrl')
    .optional()
    .isURL()
    .withMessage('Project URL must be a valid URL'),

  body('requirements')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Requirements cannot exceed 1000 characters'),

  body('benefits')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Benefits cannot exceed 500 characters'),

  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

const validateSkillSearch = [
  query('skills')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Skills must be an array with 1-10 items'),

  query('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Skill name must be between 1 and 30 characters'),

  query('experienceLevel')
    .optional()
    .isIn(['junior', 'mid', 'senior', 'lead', 'principal'])
    .withMessage('Invalid experience level'),

  query('category')
    .optional()
    .isIn(['web-development', 'mobile-development', 'data-science', 'machine-learning', 'devops', 'blockchain', 'game-development', 'frontend', 'backend', 'fullstack', 'open-source', 'other'])
    .withMessage('Invalid category'),

  handleValidationErrors
];

// Application validation rules
const validateApplicationCreation = [
  body('project')
    .isMongoId()
    .withMessage('Valid project ID is required'),

  body('coverLetter')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Cover letter must be between 50 and 2000 characters'),

  body('proposedRole')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Proposed role must be between 2 and 100 characters'),

  body('skillsOffered')
    .isArray({ min: 1, max: 10 })
    .withMessage('Skills offered must be an array with 1-10 items'),

  body('availability.hoursPerWeek')
    .isInt({ min: 1, max: 168 })
    .withMessage('Hours per week must be between 1 and 168'),

  body('availability.startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),

  body('availability.endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),

  handleValidationErrors
];

const validateApplicationUpdate = [
  body('status')
    .optional()
    .isIn(['pending', 'under-review', 'accepted', 'rejected', 'withdrawn'])
    .withMessage('Invalid status'),

  body('reviewNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review notes cannot exceed 1000 characters'),

  handleValidationErrors
];

// Message validation rules
const validateMessageCreation = [
  body('recipient')
    .isMongoId()
    .withMessage('Valid recipient ID is required'),

  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),

  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message content must be between 1 and 5000 characters'),

  body('project')
    .optional()
    .isMongoId()
    .withMessage('Invalid project ID'),

  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority'),

  body('category')
    .optional()
    .isIn(['general', 'project-inquiry', 'collaboration', 'feedback', 'support', 'other'])
    .withMessage('Invalid category'),

  handleValidationErrors
];

// Review validation rules
const validateReviewCreation = [
  body('project')
    .isMongoId()
    .withMessage('Valid project ID is required'),

  body('reviewee')
    .isMongoId()
    .withMessage('Valid reviewee ID is required'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('comment')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Comment must be between 10 and 2000 characters'),

  body('categories.communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),

  body('categories.technicalSkills')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Technical skills rating must be between 1 and 5'),

  body('categories.reliability')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Reliability rating must be between 1 and 5'),

  body('categories.teamwork')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Teamwork rating must be between 1 and 5'),

  body('categories.quality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality rating must be between 1 and 5'),

  body('wouldWorkAgain')
    .optional()
    .isBoolean()
    .withMessage('Would work again must be true or false'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be true or false'),

  handleValidationErrors
];

const validateReviewUpdate = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Comment must be between 10 and 2000 characters'),

  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateProjectCreation,
  validateProjectUpdate,
  validateApplicationCreation,
  validateApplicationUpdate,
  validateMessageCreation,
  validateReviewCreation,
  validateReviewUpdate,
  validateObjectId,
  validatePagination,
  validateSkillSearch,
  handleValidationErrors
};