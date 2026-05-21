const express = require('express');
const { createEntry, getEntriesForTrip } = require('../controllers/entryController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../services/photoStorage');

const router = express.Router({ mergeParams: true });

router.get('/', protect, getEntriesForTrip);
router.post('/', protect, upload.array('photos', 20), createEntry);

module.exports = router;
