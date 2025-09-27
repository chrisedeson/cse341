const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const memberController = require("../controllers/memberController");

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
router.get("/:id", memberController.getMemberById);
router.post("/", memberValidation, memberController.createMember);
router.put("/:id", memberValidation, memberController.updateMember);
router.delete("/:id", memberController.deleteMember);

// Book borrowing/returning routes
router.post("/:memberId/borrow/:bookId", memberController.borrowBook);
router.post("/:memberId/return/:bookId", memberController.returnBook);

module.exports = router;
