const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { createMeetingRules } = require('../middleware/validators');
const {
  createMeeting,
  getMyMeetings,
  updateMeetingStatus,
  deleteMeeting
} = require('../controllers/meetingController');

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Meeting scheduling with conflict detection
 */

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: Schedule a new meeting
 *     tags: [Meetings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [attendeeId, title, startTime, endTime]
 *             properties:
 *               attendeeId: { type: string }
 *               title: { type: string }
 *               description: { type: string }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               meetingLink: { type: string }
 *               notes: { type: string }
 */
router.post('/', protect, createMeetingRules, createMeeting);

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     summary: Get all meetings for current user
 *     tags: [Meetings]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', protect, getMyMeetings);

/**
 * @swagger
 * /api/meetings/{id}/status:
 *   put:
 *     summary: Accept, reject, or cancel a meeting
 *     tags: [Meetings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [accepted, rejected, cancelled] }
 */
router.put('/:id/status', protect, updateMeetingStatus);

/**
 * @swagger
 * /api/meetings/{id}:
 *   delete:
 *     summary: Delete a meeting (host only)
 *     tags: [Meetings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:id', protect, deleteMeeting);

module.exports = router;
