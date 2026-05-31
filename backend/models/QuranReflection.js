const mongoose = require('mongoose');

const quranReflectionSchema = new mongoose.Schema(
  {
    // One reflection per day — upserted on save
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },

    ayah: {
      type: String,
      default: '',
      trim: true,
    },

    lesson: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const QuranReflection = mongoose.model('QuranReflection', quranReflectionSchema);

module.exports = QuranReflection;
