const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// ─── GET /api/settings ────────────────────────────────────────
// Returns the single settings document.
// If it doesn't exist yet, creates it with default values.
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findById('app_settings');

    if (!settings) {
      // First time the app runs — create the default settings
      settings = await Settings.create({
        _id: 'app_settings',
        examDate: new Date('2025-11-15T08:00:00.000Z'),
        dailyQuranTarget: 20,
        mentorCode: '786',
      });
      console.log('Default settings created');
    } else if (settings.dailyQuranTarget === 5) {
      // Migrate existing settings from old default (5) to Ansar's real target (20)
      settings = await Settings.findByIdAndUpdate(
        'app_settings',
        { $set: { dailyQuranTarget: 20 } },
        { new: true }
      );
      console.log('Settings migrated: dailyQuranTarget updated to 20');
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('GET /api/settings error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
});

// ─── POST /api/settings ───────────────────────────────────────
// Updates the settings document (upsert — creates if doesn't exist).
// Body can contain any combination of: examDate, dailyQuranTarget, mentorCode
router.post('/', async (req, res) => {
  try {
    const { examDate, dailyQuranTarget, mentorCode } = req.body;

    const updateData = {};
    if (examDate !== undefined) updateData.examDate = new Date(examDate);
    if (dailyQuranTarget !== undefined) updateData.dailyQuranTarget = dailyQuranTarget;
    if (mentorCode !== undefined) updateData.mentorCode = mentorCode;

    const settings = await Settings.findByIdAndUpdate(
      'app_settings',
      { $set: updateData },
      {
        new: true,       // return the updated document
        upsert: true,    // create if doesn't exist
        setDefaultsOnInsert: true,
      }
    );

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('POST /api/settings error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
});

module.exports = router;
