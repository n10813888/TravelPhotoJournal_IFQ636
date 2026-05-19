const express = require('express');
const { createTrip, getMyTrips, getTripById } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../services/photoStorage');

const router = express.Router();

router.get('/', protect, getMyTrips);
router.get('/:id', protect, getTripById);
router.post('/', protect, upload.single('coverPhoto'), createTrip);

module.exports = router;
