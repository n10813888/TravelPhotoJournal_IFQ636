const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caption: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Entry', entrySchema);
