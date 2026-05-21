const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Entry = require('../models/Entry');
const { publicUrlFor, removePhoto } = require('../services/photoStorage');

const formatTripWithOwner = (tripDoc) => {
  const obj = tripDoc.toObject ? tripDoc.toObject() : tripDoc;
  if (obj.userId && typeof obj.userId === 'object' && obj.userId._id) {
    obj.ownerName = obj.userId.name;
    obj.userId = obj.userId._id;
  }
  return obj;
};

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

const getTripById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  try {
    const trip = await Trip.findById(id).populate('userId', 'name');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const ownerId = trip.userId._id || trip.userId;
    const isOwner = req.user && String(ownerId) === String(req.user.id);
    if (!isOwner && !trip.isPublic) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(formatTripWithOwner(trip));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicFeed = async (_req, res) => {
  try {
    const trips = await Trip.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'name');
    res.json(trips.map(formatTripWithOwner));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findOwnedTrip = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const trip = await Trip.findById(id);
  if (!trip) return null;
  if (String(trip.userId) !== String(userId)) return null;
  return trip;
};

const updateTrip = async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await findOwnedTrip(id, req.user.id);
    if (!trip) {
      if (req.file) removePhoto(req.file.filename);
      return res.status(404).json({ message: 'Trip not found' });
    }

    const { title, destination, startDate, endDate, description, isPublic } = req.body;

    const nextStart = startDate ? new Date(startDate) : trip.startDate;
    const nextEnd =
      endDate === '' ? null : endDate ? new Date(endDate) : trip.endDate;

    if (nextEnd && nextStart && nextEnd < nextStart) {
      if (req.file) removePhoto(req.file.filename);
      return res
        .status(400)
        .json({ message: 'End date must be on or after start date' });
    }

    if (title !== undefined) trip.title = title;
    if (destination !== undefined) trip.destination = destination;
    if (startDate !== undefined) trip.startDate = nextStart;
    if (endDate !== undefined) trip.endDate = nextEnd || undefined;
    if (description !== undefined) trip.description = description;
    if (isPublic !== undefined) trip.isPublic = parseIsPublic(isPublic);

    if (req.file) {
      const oldPhoto = trip.coverPhoto;
      trip.coverPhoto = publicUrlFor(req.file.filename);
      if (oldPhoto) removePhoto(oldPhoto);
    }

    const updated = await trip.save();
    res.json(updated);
  } catch (error) {
    if (req.file) removePhoto(req.file.filename);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteTrip = async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await findOwnedTrip(id, req.user.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    await Entry.deleteMany({ tripId: trip._id });
    if (trip.coverPhoto) removePhoto(trip.coverPhoto);
    await trip.deleteOne();

    res.json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getPublicFeed,
};
