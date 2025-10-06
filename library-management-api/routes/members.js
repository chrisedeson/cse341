const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const memberController = require("../controllers/memberController");
const { authenticateToken } = require("../middleware/auth");

// Query parameter validation for GET routes
const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be a positive integer between 1 and 100")
    .toInt(),
];

// Validation middleware for member creation/update
const memberValidation = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("phone")
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please enter a valid phone number"),
  body("membershipType")
    .optional()
    .isIn(["Basic", "Premium", "Student", "Senior"])
    .withMessage("Invalid membership type"),
  body("address.zipCode")
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage("Please enter a valid ZIP code"),
];

// Routes
/**
 * @swagger
 * /members:
 *   get:
 *     summary: Get all library members with pagination and filtering
 *     tags: [Members]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page (max 100)
 *         required: false
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       - name: membershipType
 *         in: query
 *         description: Filter by membership type
 *         required: false
 *         type: string
 *         enum: [Basic, Premium, Student, Senior]
 *       - name: isActive
 *         in: query
 *         description: Filter by active status
 *         required: false
 *         type: boolean
 */
router.get("/", paginationValidation, memberController.getAllMembers);

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Get a library member by ID
 *     tags: [Members]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Member ID
 *         required: true
 *         type: string
 */
router.get("/:id", memberController.getMemberById);

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Create a new library member
 *     tags: [Members]
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Member data
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - firstName
 *             - lastName
 *             - email
 *             - phone
 *           properties:
 *             firstName:
 *               type: string
 *               maxLength: 50
 *               example: John
 *             lastName:
 *               type: string
 *               maxLength: 50
 *               example: Doe
 *             email:
 *               type: string
 *               format: email
 *               example: john.doe@example.com
 *             phone:
 *               type: string
 *               pattern: '^[\+]?[1-9][\d]{0,15}$'
 *               example: '+1234567890'
 *             membershipType:
 *               type: string
 *               enum: [Basic, Premium, Student, Senior]
 *               default: Basic
 *               example: Premium
 *             address:
 *               type: object
 *               properties:
 *                 street:
 *                   type: string
 *                   maxLength: 100
 *                   example: 123 Main St
 *                 city:
 *                   type: string
 *                   maxLength: 50
 *                   example: Anytown
 *                 state:
 *                   type: string
 *                   maxLength: 50
 *                   example: CA
 *                 zipCode:
 *                   type: string
 *                   pattern: '^\d{5}(-\d{4})?$'
 *                   example: '12345'
 */
router.post("/", authenticateToken, memberValidation, memberController.createMember);

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Update a library member
 *     tags: [Members]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Member ID
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         description: Updated member data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *               maxLength: 50
 *               example: John
 *             lastName:
 *               type: string
 *               maxLength: 50
 *               example: Doe
 *             email:
 *               type: string
 *               format: email
 *               example: john.doe@example.com
 *             phone:
 *               type: string
 *               pattern: '^[\+]?[1-9][\d]{0,15}$'
 *               example: '+1234567890'
 *             membershipType:
 *               type: string
 *               enum: [Basic, Premium, Student, Senior]
 *               example: Premium
 *             address:
 *               type: object
 *               properties:
 *                 street:
 *                   type: string
 *                   maxLength: 100
 *                   example: 123 Main St
 *                 city:
 *                   type: string
 *                   maxLength: 50
 *                   example: Anytown
 *                 state:
 *                   type: string
 *                   maxLength: 50
 *                   example: CA
 *                 zipCode:
 *                   type: string
 *                   pattern: '^\d{5}(-\d{4})?$'
 *                   example: '12345'
 *             isActive:
 *               type: boolean
 *               example: true
 */
router.put("/:id", authenticateToken, memberValidation, memberController.updateMember);

/**
 * @swagger
 * /members/{id}:
 *   delete:
 *     summary: Delete a library member
 *     tags: [Members]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Member ID
 *         required: true
 *         type: string
 */
router.delete("/:id", authenticateToken, memberController.deleteMember);

// Book borrowing/returning routes
router.post("/:memberId/borrow/:bookId", authenticateToken, memberController.borrowBook);
router.post("/:memberId/return/:bookId", authenticateToken, memberController.returnBook);

module.exports = router;
