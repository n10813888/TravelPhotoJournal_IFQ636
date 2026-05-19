const express = require('express');
const {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../services/photoStorage');

const router = express.Router();

router.get('/', protect, getMyTrips);
router.get('/:id', protect, getTripById);
router.post('/', protect, upload.single('coverPhoto'), createTrip);
router.put('/:id', protect, upload.single('coverPhoto'), updateTrip);
router.delete('/:id', protect, deleteTrip);

module.exports = router;
