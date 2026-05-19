const Trip = require('../models/Trip');
const { publicUrlFor, removePhoto } = require('../services/photoStorage');

const parseIsPublic = (raw) => {
  if (raw === undefined || raw === null || raw === '') return false;
  if (typeof raw === 'boolean') return raw;
  return ['true', '1', 'on', 'yes'].includes(String(raw).toLowerCase());
};

const createTrip = async (req, res) => {
  const { title, destination, startDate, endDate, description, isPublic } = req.body;

  if (!title || !destination || !startDate) {
    if (req.file) removePhoto(req.file.filename);
    return res
      .status(400)
      .json({ message: 'title, destination, and startDate are required' });
  }

  if (endDate && new Date(endDate) < new Date(startDate)) {
    if (req.file) removePhoto(req.file.filename);
    return res
      .status(400)
      .json({ message: 'End date must be on or after start date' });
  }

  try {
    const trip = await Trip.create({
      userId: req.user.id,
      title,
      destination,
      startDate,
      endDate: endDate || undefined,
      description: description || '',
      isPublic: parseIsPublic(isPublic),
      coverPhoto: req.file ? publicUrlFor(req.file.filename) : undefined,
    });
    res.status(201).json(trip);
  } catch (error) {
    if (req.file) removePhoto(req.file.filename);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ startDate: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTrip, getMyTrips };
