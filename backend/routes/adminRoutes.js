const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
  getStats,
  listUsers,
  deactivateUser,
  deleteUser,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.patch('/users/:id/deactivate', deactivateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
