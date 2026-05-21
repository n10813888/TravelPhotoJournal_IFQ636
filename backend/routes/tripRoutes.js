const express = require('express');
const {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getPublicFeed,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { optionalAuth } = require('../middleware/optionalAuth');
const { upload } = require('../services/photoStorage');

const router = express.Router();

// Public — must come before /:id so it doesn't match the param route
router.get('/public', getPublicFeed);

router.get('/', protect, getMyTrips);
router.get('/:id', optionalAuth, getTripById);
router.post('/', protect, upload.single('coverPhoto'), createTrip);
router.put('/:id', protect, upload.single('coverPhoto'), updateTrip);
router.delete('/:id', protect, deleteTrip);

module.exports = router;
