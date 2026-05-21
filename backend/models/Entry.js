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
    entryDate: { type: Date, default: () => new Date() },
    photos: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one photo is required',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Entry', entrySchema);
