const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Entry = require('../models/Entry');
const { publicUrlFor, removePhoto } = require('../services/photoStorage');

const cleanupFiles = (files) => {
  if (!files) return;
  files.forEach((f) => removePhoto(f.filename));
};

const findTripForWrite = async (tripId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(tripId)) return null;
  const trip = await Trip.findById(tripId);
  if (!trip) return null;
  if (String(trip.userId) !== String(userId)) return null;
  return trip;
};

const findTripForRead = async (tripId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(tripId)) return null;
  const trip = await Trip.findById(tripId);
  if (!trip) return null;
  const isOwner = userId && String(trip.userId) === String(userId);
  if (!isOwner && !trip.isPublic) return null;
  return trip;
};

const createEntry = async (req, res) => {
  const { tripId } = req.params;
  const files = req.files || [];

  if (files.length === 0) {
    return res.status(400).json({ message: 'At least one photo is required' });
  }

  try {
    const trip = await findTripForWrite(tripId, req.user.id);
    if (!trip) {
      cleanupFiles(files);
      return res.status(404).json({ message: 'Trip not found' });
    }

    const photos = files.map((f) => publicUrlFor(f.filename));
    const entry = await Entry.create({
      tripId: trip._id,
      userId: req.user.id,
      caption: req.body.caption || '',
      entryDate: req.body.entryDate || new Date(),
      photos,
    });

    res.status(201).json(entry);
  } catch (error) {
    cleanupFiles(files);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const findOwnedEntry = async (tripId, entryId, userId) => {
  if (
    !mongoose.Types.ObjectId.isValid(tripId) ||
    !mongoose.Types.ObjectId.isValid(entryId)
  ) {
    return null;
  }
  const trip = await Trip.findById(tripId);
  if (!trip || String(trip.userId) !== String(userId)) return null;
  const entry = await Entry.findOne({ _id: entryId, tripId: trip._id });
  return entry;
};

const parseRemoveList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const updateEntry = async (req, res) => {
  const { tripId, entryId } = req.params;
  const files = req.files || [];

  try {
    const entry = await findOwnedEntry(tripId, entryId, req.user.id);
    if (!entry) {
      cleanupFiles(files);
      return res.status(404).json({ message: 'Entry not found' });
    }

    const removeList = parseRemoveList(req.body.removePhotos);
    const remainingPhotos = entry.photos.filter((p) => !removeList.includes(p));
    const newPhotos = files.map((f) => publicUrlFor(f.filename));
    const nextPhotos = [...remainingPhotos, ...newPhotos];

    if (nextPhotos.length === 0) {
      cleanupFiles(files);
      return res
        .status(400)
        .json({ message: 'At least one photo is required' });
    }

    if (req.body.caption !== undefined) entry.caption = req.body.caption;
    if (req.body.entryDate) entry.entryDate = new Date(req.body.entryDate);
    entry.photos = nextPhotos;

    const updated = await entry.save();
    removeList.forEach((url) => removePhoto(url));
    res.json(updated);
  } catch (error) {
    cleanupFiles(files);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteEntry = async (req, res) => {
  const { tripId, entryId } = req.params;
  try {
    const entry = await findOwnedEntry(tripId, entryId, req.user.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const photos = [...entry.photos];
    await entry.deleteOne();
    photos.forEach((url) => removePhoto(url));

    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEntriesForTrip = async (req, res) => {
  const { tripId } = req.params;
  try {
    const trip = await findTripForRead(tripId, req.user?.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const entries = await Entry.find({ tripId: trip._id }).sort({ entryDate: 1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEntry,
  getEntriesForTrip,
  updateEntry,
  deleteEntry,
};
