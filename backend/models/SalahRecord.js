const mongoose = require('mongoose');

// Fixed prayer names — always in this order
const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const prayerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: PRAYER_NAMES,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    jamaah: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false } // no separate _id for subdocuments
);

const salahRecordSchema = new mongoose.Schema(
  {
    // One document per day — stored as start-of-day UTC
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    prayers: {
      type: [prayerSchema],
      default: () =>
        PRAYER_NAMES.map(name => ({
          name,
          completed: false,
          jamaah: false,
          notes: '',
        })),
    },
  },
  {
    timestamps: true,
  }
);

// Static helper — build a fresh prayers array
salahRecordSchema.statics.freshPrayers = function () {
  return PRAYER_NAMES.map(name => ({
    name,
    completed: false,
    jamaah: false,
    notes: '',
  }));
};

const SalahRecord = mongoose.model('SalahRecord', salahRecordSchema);

module.exports = SalahRecord;
