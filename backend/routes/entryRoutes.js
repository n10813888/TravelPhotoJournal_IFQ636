const express = require('express');
const {
  createEntry,
  getEntriesForTrip,
  updateEntry,
  deleteEntry,
} = require('../controllers/entryController');
const { protect } = require('../middleware/authMiddleware');
const { optionalAuth } = require('../middleware/optionalAuth');
const { upload } = require('../services/photoStorage');

const router = express.Router({ mergeParams: true });

router.get('/', optionalAuth, getEntriesForTrip);
router.post('/', protect, upload.array('photos', 20), createEntry);
router.put('/:entryId', protect, upload.array('photos', 20), updateEntry);
router.delete('/:entryId', protect, deleteEntry);

module.exports = router;
