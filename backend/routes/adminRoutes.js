const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
  getStats,
  listUsers,
  deactivateUser,
  deleteUser,
  listAllTrips,
  listAllEntries,
  deleteTripAsAdmin,
  deleteEntryAsAdmin,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.patch('/users/:id/deactivate', deactivateUser);
router.delete('/users/:id', deleteUser);

router.get('/trips', listAllTrips);
router.delete('/trips/:id', deleteTripAsAdmin);

router.get('/entries', listAllEntries);
router.delete('/entries/:id', deleteEntryAsAdmin);

module.exports = router;
