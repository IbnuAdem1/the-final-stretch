const mongoose = require('mongoose');

const mentorFeedbackSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },

    mentorName: {
      type: String,
      default: 'Ustadh Ibrahim',
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt used to find the most recent feedback
  }
);

const MentorFeedback = mongoose.model('MentorFeedback', mentorFeedbackSchema);

module.exports = MentorFeedback;
