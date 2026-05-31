const mongoose = require('mongoose');

const studyTaskSchema = new mongoose.Schema(
  {
    // The date this task belongs to (stored as start-of-day UTC)
    date: {
      type: Date,
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    task: {
      type: String,
      required: true,
      trim: true,
    },

    // Human-readable duration string e.g. "2 hours", "45 min"
    duration: {
      type: String,
      default: '',
      trim: true,
    },

    estimatedHours: {
      type: Number,
      default: 1,
      min: 0,
    },

    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },

    completed: {
      type: Boolean,
      default: false,
    },

    // true  = this is a plan item for tomorrow
    // false = this is a task for today
    isForTomorrow: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const StudyTask = mongoose.model('StudyTask', studyTaskSchema);

module.exports = StudyTask;
