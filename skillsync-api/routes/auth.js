const express = require('express');
const router = express.Router();
const { passport, generateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints for GitHub OAuth
 */

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth login
 *     tags: [Auth]
 *     description: |
 *       **⚠️ NOTE: This endpoint must be accessed directly in your browser, not from Swagger UI.**
 *       
 *       To test GitHub OAuth:
 *       1. Open this URL in your browser: `https://skillsync-api-q8jx.onrender.com/api/auth/github`
 *       2. You will be redirected to GitHub to authorize the app
 *       3. After authorization, you'll be redirected back with a JWT token
 *       
 *       This endpoint redirects to GitHub for OAuth authentication.
 *     responses:
 *       302:
 *         description: Redirects to GitHub OAuth page
 *       500:
 *         description: Server error
 */
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [Auth]
 *     description: Handles the callback from GitHub after authentication
 *     responses:
 *       200:
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Authentication successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for subsequent requests
 *                     user:
 *                       type: object
 *                       description: Authenticated user data
 *       401:
 *         description: Authentication failed
 */
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/api/auth/failure',
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user);

      // Return token and user info
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generating authentication token',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/failure:
 *   get:
 *     summary: Authentication failure endpoint
 *     tags: [Auth]
 *     description: Handles authentication failures
 *     responses:
 *       401:
 *         description: Authentication failed
 */
router.get('/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Authentication failed. Please try again.'
  });
});

module.exports = router;
