const mongoose = require('mongoose');

const studyReflectionSchema = new mongoose.Schema(
  {
    // One reflection document per day — we upsert on this date field
    date: {
      type: Date,
      required: true,
      unique: true, // enforces one-per-day at the DB level
      index: true,
    },

    wentWell: {
      type: String,
      default: '',
      trim: true,
    },

    distracted: {
      type: String,
      default: '',
      trim: true,
    },

    improve: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const StudyReflection = mongoose.model('StudyReflection', studyReflectionSchema);

module.exports = StudyReflection;
