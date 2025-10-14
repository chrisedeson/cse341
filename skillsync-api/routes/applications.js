const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  getProjectApplications,
  getMyApplications
} = require('../controllers/applications');

const { protect } = require('../middleware/auth');
const {
  validateApplicationCreation,
  validateApplicationUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       required:
 *         - project
 *         - coverLetter
 *         - proposedRole
 *         - skillsOffered
 *         - availability
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the application
 *         project:
 *           type: string
 *           description: ID of the project
 *         applicant:
 *           type: string
 *           description: ID of the applicant (auto-set to current user)
 *         coverLetter:
 *           type: string
 *           description: Cover letter for the application
 *         proposedRole:
 *           type: string
 *           description: Role the applicant is applying for
 *         skillsOffered:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 *         availability:
 *           type: object
 *           properties:
 *             hoursPerWeek:
 *               type: number
 *             startDate:
 *               type: string
 *               format: date
 *             endDate:
 *               type: string
 *               format: date
 *         expectedCompensation:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *             currency:
 *               type: string
 *               enum: [USD, EUR, GBP, CAD, AUD]
 *             type:
 *               type: string
 *               enum: [hourly, fixed, volunteer]
 *         status:
 *           type: string
 *           enum: [pending, under-review, accepted, rejected, withdrawn]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get all applications with filters
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, under-review, accepted, rejected, withdrawn]
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of applications
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, validatePagination, getApplications);

/**
 * @swagger
 * /api/applications/my/applications:
 *   get:
 *     summary: Get current user's applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's applications
 */
router.get('/my/applications', protect, getMyApplications);

/**
 * @swagger
 * /api/applications/project/{projectId}:
 *   get:
 *     summary: Get applications for a specific project
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project applications
 */
router.get('/project/:projectId', protect, validateObjectId, getProjectApplications);

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     tags: [Applications]
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
 *         description: Application details
 *       404:
 *         description: Application not found
 */
router.get('/:id', protect, validateObjectId, getApplication);

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Application'
 *     responses:
 *       201:
 *         description: Application created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', protect, validateApplicationCreation, createApplication);

/**
 * @swagger
 * /api/applications/{id}:
 *   put:
 *     summary: Update an application
 *     tags: [Applications]
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
 *             $ref: '#/components/schemas/Application'
 *     responses:
 *       200:
 *         description: Application updated successfully
 *       404:
 *         description: Application not found
 */
router.put('/:id', protect, validateObjectId, validateApplicationUpdate, updateApplication);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: Delete an application
 *     tags: [Applications]
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
 *         description: Application deleted successfully
 *       404:
 *         description: Application not found
 */
router.delete('/:id', protect, validateObjectId, deleteApplication);

module.exports = router;
