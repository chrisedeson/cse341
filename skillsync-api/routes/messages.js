const express = require('express');
const router = express.Router();
const {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  getConversation,
  getUnreadCount
} = require('../controllers/messages');

const { protect } = require('../middleware/auth');
const {
  validateMessageCreation,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - recipient
 *         - subject
 *         - content
 *       properties:
 *         id:
 *           type: string
 *         sender:
 *           type: string
 *           description: ID of the sender (auto-set to current user)
 *         recipient:
 *           type: string
 *           description: ID of the recipient
 *         subject:
 *           type: string
 *         content:
 *           type: string
 *         project:
 *           type: string
 *           description: Related project ID (optional)
 *         isRead:
 *           type: boolean
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *         category:
 *           type: string
 *           enum: [general, project-inquiry, collaboration, feedback, support, other]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get user's messages (inbox or sent)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [inbox, sent]
 *           default: inbox
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/', protect, validatePagination, getMessages);

/**
 * @swagger
 * /api/messages/unread/count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread message count
 */
router.get('/unread/count', protect, getUnreadCount);

/**
 * @swagger
 * /api/messages/conversation/{userId}:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation messages
 */
router.get('/conversation/:userId', protect, validateObjectId, getConversation);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Get message by ID
 *     tags: [Messages]
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
 *         description: Message details
 *       404:
 *         description: Message not found
 */
router.get('/:id', protect, validateObjectId, getMessage);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 */
router.post('/', protect, validateMessageCreation, createMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   put:
 *     summary: Update a message (mark as read, archive, etc.)
 *     tags: [Messages]
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
 *               action:
 *                 type: string
 *                 enum: [markRead, archive, toggleFlag]
 *     responses:
 *       200:
 *         description: Message updated successfully
 */
router.put('/:id', protect, validateObjectId, updateMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
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
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 */
router.delete('/:id', protect, validateObjectId, deleteMessage);

module.exports = router;
