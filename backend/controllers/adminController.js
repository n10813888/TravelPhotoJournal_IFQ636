const mongoose = require('mongoose');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Entry = require('../models/Entry');
const { removePhoto } = require('../services/photoStorage');

const getStats = async (_req, res) => {
  try {
    const [users, trips, entries, publicTrips] = await Promise.all([
      User.countDocuments(),
      Trip.countDocuments(),
      Entry.countDocuments(),
      Trip.countDocuments({ isPublic: true }),
    ]);
    res.json({ users, trips, entries, publicTrips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listUsers = async (_req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deactivateUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (String(id) === String(req.user.id)) {
    return res
      .status(400)
      .json({ message: 'Admins cannot deactivate their own account' });
  }
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = false;
    await user.save();
    res.json({ id: user.id, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (String(id) === String(req.user.id)) {
    return res
      .status(400)
      .json({ message: 'Admins cannot delete their own account' });
  }
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Collect all photo URLs to clean up after DB ops
    const [trips, entries] = await Promise.all([
      Trip.find({ userId: user._id }),
      Entry.find({ userId: user._id }),
    ]);
    const photos = [
      ...trips.map((t) => t.coverPhoto).filter(Boolean),
      ...entries.flatMap((e) => e.photos),
    ];

    await Entry.deleteMany({ userId: user._id });
    await Trip.deleteMany({ userId: user._id });
    await user.deleteOne();

    photos.forEach((url) => removePhoto(url));
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, listUsers, deactivateUser, deleteUser };
