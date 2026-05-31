const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // Singleton key — there will only ever be ONE settings document
    _id: { type: String, default: 'app_settings' },

    // The national exam date Ansar is preparing for
    examDate: {
      type: Date,
      default: new Date('2026-07-01T08:00:00.000Z'),
    },

    // How many Quran pages Ansar aims to read per day
    dailyQuranTarget: {
      type: Number,
      default: 20,
    },

    // Code used to unlock mentor mode on the Study page
    // In a real app this would be hashed — kept plain for simplicity now
    // TODO: Hash this with bcrypt when adding proper authentication
    mentorCode: {
      type: String,
      default: '786',
    },
  },
  {
    // Disable the auto-generated _id so our fixed string _id works
    _id: false,
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
