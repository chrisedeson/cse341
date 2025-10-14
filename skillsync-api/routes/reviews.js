const express = require('express');
const router = express.Router();
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getProjectReviews,
  addResponse,
  markHelpful
} = require('../controllers/reviews');

const { protect, optionalAuth } = require('../middleware/auth');
const {
  validateReviewCreation,
  validateReviewUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - project
 *         - reviewee
 *         - rating
 *         - title
 *         - comment
 *       properties:
 *         id:
 *           type: string
 *         project:
 *           type: string
 *           description: ID of the project
 *         reviewer:
 *           type: string
 *           description: ID of the reviewer (auto-set to current user)
 *         reviewee:
 *           type: string
 *           description: ID of the person being reviewed
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         title:
 *           type: string
 *         comment:
 *           type: string
 *         categories:
 *           type: object
 *           properties:
 *             communication:
 *               type: number
 *             technicalSkills:
 *               type: number
 *             reliability:
 *               type: number
 *             teamwork:
 *               type: number
 *             quality:
 *               type: number
 *         wouldWorkAgain:
 *           type: boolean
 *         isPublic:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews with filters
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: reviewee
 *         schema:
 *           type: string
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/', validatePagination, getReviews);

/**
 * @swagger
 * /api/reviews/user/{userId}:
 *   get:
 *     summary: Get reviews for a specific user
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User reviews with statistics
 */
router.get('/user/:userId', validateObjectId, getUserReviews);

/**
 * @swagger
 * /api/reviews/project/{projectId}:
 *   get:
 *     summary: Get reviews for a specific project
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project reviews
 */
router.get('/project/:projectId', validateObjectId, getProjectReviews);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
router.get('/:id', optionalAuth, validateObjectId, getReview);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', protect, validateReviewCreation, createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       404:
 *         description: Review not found
 */
router.put('/:id', protect, validateObjectId, validateReviewUpdate, updateReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
router.delete('/:id', protect, validateObjectId, deleteReview);

/**
 * @swagger
 * /api/reviews/{id}/response:
 *   post:
 *     summary: Add a response to a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response added successfully
 */
router.post('/:id/response', protect, validateObjectId, addResponse);

/**
 * @swagger
 * /api/reviews/{id}/helpful:
 *   post:
 *     summary: Mark a review as helpful
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review marked as helpful
 */
router.post('/:id/helpful', protect, validateObjectId, markHelpful);

module.exports = router;
