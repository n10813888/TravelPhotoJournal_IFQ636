const express = require('express');
const { createTrip } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../services/photoStorage');

const router = express.Router();

router.post('/', protect, upload.single('coverPhoto'), createTrip);

module.exports = router;
