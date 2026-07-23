const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { getDeals, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController');

router.get('/', protect, getDeals);
router.post('/', protect, authorize('investor'), createDeal);
router.put('/:id', protect, authorize('investor'), updateDeal);
router.delete('/:id', protect, authorize('investor'), deleteDeal);

module.exports = router;
