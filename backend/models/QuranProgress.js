const mongoose = require('mongoose');

const quranProgressSchema = new mongoose.Schema(
  {
    // One document per day — stored as start-of-day UTC
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },

    pagesRead: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Comes from Settings.dailyQuranTarget at creation time
    targetPages: {
      type: Number,
      default: 5,
      min: 1,
    },

    // True when Ansar taps "I completed my daily Quran portion"
    dailyPortionDone: {
      type: Boolean,
      default: false,
    },

    // Which surah / section was assigned for today
    surah: {
      type: String,
      default: '',
      trim: true,
    },

    fromPage: {
      type: Number,
      default: 0,
    },

    toPage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const QuranProgress = mongoose.model('QuranProgress', quranProgressSchema);

module.exports = QuranProgress;
