const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { getDeals, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController');

/**
 * @swagger
 * /api/deals:
 *   get:
 *     summary: Get all deals
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deals
 */
router.get('/', protect, getDeals);

/**
 * @swagger
 * /api/deals:
 *   post:
 *     summary: Create a new deal (investor only)
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entrepreneurId:
 *                 type: string
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Deal created
 */
router.post('/', protect, authorize('investor'), createDeal);

/**
 * @swagger
 * /api/deals/{id}:
 *   put:
 *     summary: Update a deal (investor only)
 *     tags: [Deals]
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
 *         description: Deal updated
 */
router.put('/:id', protect, authorize('investor'), updateDeal);

/**
 * @swagger
 * /api/deals/{id}:
 *   delete:
 *     summary: Delete a deal (investor only)
 *     tags: [Deals]
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
 *         description: Deal deleted
 */
router.delete('/:id', protect, authorize('investor'), deleteDeal);

module.exports = router;
