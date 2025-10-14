const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/projects');

const { protect } = require('../middleware/auth');
const {
  validateProjectCreation,
  validateProjectUpdate,
  validateObjectId,
  validatePagination,
  validateSkillSearch
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - requiredSkills
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the project
 *         title:
 *           type: string
 *           description: Project title
 *         description:
 *           type: string
 *           description: Detailed project description
 *         shortDescription:
 *           type: string
 *           description: Auto-generated short description
 *         owner:
 *           type: string
 *           description: ID of the project owner
 *         status:
 *           type: string
 *           enum: [planning, open, in-progress, completed, cancelled]
 *           default: planning
 *         category:
 *           type: string
 *           enum: [web-development, mobile-development, data-science, machine-learning, devops, blockchain, game-development, frontend, backend, fullstack, open-source, other]
 *           description: Project category
 *         requiredSkills:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 *               isRequired:
 *                 type: boolean
 *         teamMembers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               role:
 *                 type: string
 *               joinedAt:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, inactive, removed]
 *         maxTeamSize:
 *           type: number
 *           default: 5
 *         budget:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *             max:
 *               type: number
 *             currency:
 *               type: string
 *               enum: [USD, EUR, GBP, CAD, AUD]
 *         timeline:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *             endDate:
 *               type: string
 *               format: date
 *             estimatedDuration:
 *               type: number
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced, expert]
 *         technologies:
 *           type: array
 *           items:
 *             type: string
 *         repositoryUrl:
 *           type: string
 *         projectUrl:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isRemote:
 *           type: boolean
 *           default: true
 *         location:
 *           type: string
 *         timezone:
 *           type: string
 *         communication:
 *           type: object
 *           properties:
 *             platform:
 *               type: string
 *               enum: [slack, discord, microsoft-teams, zoom, google-meet, skype, email, other]
 *             frequency:
 *               type: string
 *               enum: [daily, weekly, bi-weekly, monthly, as-needed]
 *         requirements:
 *           type: string
 *         benefits:
 *           type: string
 *         views:
 *           type: number
 *         featured:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects with optional filters
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of projects per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, open, in-progress, completed, cancelled]
 *         description: Filter by project status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [web-development, mobile-development, data-science, machine-learning, devops, blockchain, game-development, frontend, backend, fullstack, open-source, other]
 *         description: Filter by project category
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by required skills
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced, expert]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, technologies, and tags
 *       - in: query
 *         name: owner
 *         schema:
 *           type: boolean
 *         description: If true, only return user's own projects
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - requiredSkills
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Detailed project description
 *               category:
 *                 type: string
 *                 enum: [web-development, mobile-development, data-science, machine-learning, devops, blockchain, game-development, frontend, backend, fullstack, open-source, other]
 *                 description: Project category
 *               requiredSkills:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 15
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *                       enum: [beginner, intermediate, advanced, expert]
 *                     isRequired:
 *                       type: boolean
 *               maxTeamSize:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 20
 *               budget:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                     minimum: 0
 *                   max:
 *                     type: number
 *                     minimum: 0
 *                   currency:
 *                     type: string
 *                     enum: [USD, EUR, GBP, CAD, AUD]
 *               timeline:
 *                 type: object
 *                 properties:
 *                   estimatedDuration:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 52
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 *               technologies:
 *                 type: array
 *                 maxItems: 20
 *                 items:
 *                   type: string
 *               repositoryUrl:
 *                 type: string
 *                 format: uri
 *               projectUrl:
 *                 type: string
 *                 format: uri
 *               tags:
 *                 type: array
 *                 maxItems: 10
 *                 items:
 *                   type: string
 *               isRemote:
 *                 type: boolean
 *               location:
 *                 type: string
 *               timezone:
 *                 type: string
 *               communication:
 *                 type: object
 *                 properties:
 *                   platform:
 *                     type: string
 *                     enum: [slack, discord, microsoft-teams, zoom, google-meet, skype, email, other]
 *                   frequency:
 *                     type: string
 *                     enum: [daily, weekly, bi-weekly, monthly, as-needed]
 *               requirements:
 *                 type: string
 *                 maxLength: 1000
 *               benefits:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 */
router.get('/', protect, validatePagination, getProjects);
router.post('/', protect, validateProjectCreation, createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Detailed project description
 *               category:
 *                 type: string
 *                 enum: [web-development, mobile-development, data-science, machine-learning, devops, blockchain, game-development, frontend, backend, fullstack, open-source, other]
 *                 description: Project category
 *               status:
 *                 type: string
 *                 enum: [planning, open, in-progress, completed, cancelled]
 *               requiredSkills:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 15
 *                 items:
 *                   type: object
 *               maxTeamSize:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 20
 *               budget:
 *                 type: object
 *               timeline:
 *                 type: object
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 *               technologies:
 *                 type: array
 *                 maxItems: 20
 *               repositoryUrl:
 *                 type: string
 *                 format: uri
 *               projectUrl:
 *                 type: string
 *                 format: uri
 *               tags:
 *                 type: array
 *                 maxItems: 10
 *               isRemote:
 *                 type: boolean
 *               location:
 *                 type: string
 *               timezone:
 *                 type: string
 *               communication:
 *                 type: object
 *               requirements:
 *                 type: string
 *                 maxLength: 1000
 *               benefits:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Not authorized to update this project
 *       404:
 *         description: Project not found
 *   delete:
 *     summary: Delete project (cancel)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project cancelled successfully
 *       403:
 *         description: Not authorized to delete this project
 *       404:
 *         description: Project not found
 */
router.get('/:id', protect, validateObjectId, getProject);
router.put('/:id', protect, validateObjectId, validateProjectUpdate, updateProject);
router.delete('/:id', protect, validateObjectId, deleteProject);

/**
 * @swagger
 * /api/projects/{id}/team:
 *   post:
 *     summary: Add team member to project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of user to add
 *               role:
 *                 type: string
 *                 description: Role of the team member
 *     responses:
 *       200:
 *         description: Team member added successfully
 *       403:
 *         description: Not authorized to manage this project
 *       404:
 *         description: Project or user not found
 */
router.post('/:id/team', protect, validateObjectId, addTeamMember);

/**
 * @swagger
 * /api/projects/{id}/team/{userId}:
 *   delete:
 *     summary: Remove team member from project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to remove
 *     responses:
 *       200:
 *         description: Team member removed successfully
 *       403:
 *         description: Not authorized to manage this project
 *       404:
 *         description: Project not found
 */
router.delete('/:id/team/:userId', protect, validateObjectId, removeTeamMember);

/**
 * @swagger
 * /api/projects/search/skills:
 *   get:
 *     summary: Search projects by required skills
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skills
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Skills to search for
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, open, in-progress, completed, cancelled]
 *         description: Project status filter
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [web-development, mobile-development, data-science, machine-learning, devops, blockchain, game-development, other]
 *         description: Project category filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           maximum: 50
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Projects found successfully
 *       400:
 *         description: Skills parameter required
 */
router.get('/search/skills', protect, validateSkillSearch, searchBySkills);

/**
 * @swagger
 * /api/projects/featured:
 *   get:
 *     summary: Get featured projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           maximum: 20
 *         description: Maximum number of featured projects to return
 *     responses:
 *       200:
 *         description: Featured projects retrieved successfully
 */
router.get('/featured', getFeaturedProjects);

/**
 * @swagger
 * /api/projects/stats:
 *   get:
 *     summary: Get project statistics
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', protect, getProjectStats);

/**
 * @swagger
 * /api/projects/my-projects:
 *   get:
 *     summary: Get current user's projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's projects retrieved successfully
 */
router.get('/my-projects', protect, getMyProjects);

module.exports = router;