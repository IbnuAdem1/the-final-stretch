const mongoose = require('mongoose');

const quranPlanSchema = new mongoose.Schema(
  {
    // The date this plan is FOR — always tomorrow's date when created
    date: {
      type: Date,
      required: true,
      index: true,
    },

    surah: {
      type: String,
      required: true,
      trim: true,
    },

    fromPage: {
      type: Number,
      required: true,
      min: 1,
    },

    toPage: {
      type: Number,
      required: true,
      min: 1,
    },

    notes: {
      type: String,
      default: '',
      trim: true,
    },

    done: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const QuranPlan = mongoose.model('QuranPlan', quranPlanSchema);

module.exports = QuranPlan;
