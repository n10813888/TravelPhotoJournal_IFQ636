const User = require('../models/User');
const Trip = require('../models/Trip');
const Entry = require('../models/Entry');

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

module.exports = { getStats };
