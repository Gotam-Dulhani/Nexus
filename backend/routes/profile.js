const express = require('express');
const router = express.Router();
console.log('Profile routes file required and router initialized');
router.get('/test-get', (req, res) => res.json({ message: 'Profile routes are ACTIVE', time: new Date() }));
const protect = require('../middleware/authMiddleware');
const { getMyProfile, updateMyProfile, getProfileById, getAllProfiles, uploadAvatar } = require('../controllers/profileController');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile data returned
 */
router.get('/me', protect, getMyProfile);

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Profile]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio: { type: string }
 *               location: { type: string }
 *               website: { type: string }
 *               startupName: { type: string }
 *               investmentPreferences: { type: array, items: { type: string } }
 */
router.put('/me', protect, updateMyProfile);

/**
 * @swagger
 * /api/profile/me/avatar:
 *   post:
 *     summary: Upload a new profile avatar
 *     tags: [Profile]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/me/avatar', protect, uploadAvatar);

/**
 * @swagger
 * /api/profile/{userId}:
 *   get:
 *     summary: View another user's profile
 *     tags: [Profile]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 */
router.get('/:userId', protect, getProfileById);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get all profiles
 *     tags: [Profile]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', protect, getAllProfiles);

module.exports = router;