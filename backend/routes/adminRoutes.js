const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { getStats } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', protect, requireAdmin, getStats);

module.exports = router;
