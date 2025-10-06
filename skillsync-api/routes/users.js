const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  getUsers,
  getUser,
  deleteUser,
  searchBySkills,
  getUserStats
} = require('../controllers/users');

const { protect } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateObjectId,
  validatePagination,
  validateSkillSearch
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password (not returned in responses)
 *         avatar:
 *           type: string
 *           description: URL to user's avatar image
 *         bio:
 *           type: string
 *           description: User's biography
 *         skills:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 *               yearsOfExperience:
 *                 type: number
 *         experienceLevel:
 *           type: string
 *           enum: [junior, mid, senior, lead, principal]
 *         location:
 *           type: string
 *         website:
 *           type: string
 *         linkedin:
 *           type: string
 *         github:
 *           type: string
 *         isAvailable:
 *           type: boolean
 *         preferredProjectTypes:
 *           type: array
 *           items:
 *             type: string
 *         hourlyRate:
 *           type: number
 *         timezone:
 *           type: string
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *         lastActive:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               bio:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *               experienceLevel:
 *                 type: string
 *                 enum: [junior, mid, senior, lead, principal]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', validateUserRegistration, register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateUserLogin, login);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *               experienceLevel:
 *                 type: string
 *                 enum: [junior, mid, senior, lead, principal]
 *               location:
 *                 type: string
 *               website:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               github:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *               preferredProjectTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               hourlyRate:
 *                 type: number
 *               timezone:
 *                 type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateUserUpdate, updateProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with optional filters
 *     tags: [Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by skills
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *           enum: [junior, mid, senior, lead, principal]
 *         description: Filter by experience level
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/', protect, validatePagination, getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete user account (deactivate)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (must be own account)
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       403:
 *         description: Can only delete own account
 *       404:
 *         description: User not found
 */
router.get('/:id', protect, validateObjectId, getUser);
router.delete('/:id', protect, validateObjectId, deleteUser);

/**
 * @swagger
 * /api/users/search/skills:
 *   get:
 *     summary: Search users by skills
 *     tags: [Users]
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
 *         name: experienceLevel
 *         schema:
 *           type: string
 *           enum: [junior, mid, senior, lead, principal]
 *         description: Filter by experience level
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           maximum: 50
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Users found successfully
 *       400:
 *         description: Skills parameter required
 */
router.get('/search/skills', protect, validateSkillSearch, searchBySkills);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', protect, getUserStats);

module.exports = router;