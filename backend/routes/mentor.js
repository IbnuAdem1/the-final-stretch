const express = require('express');
const router = express.Router();
const MentorFeedback = require('../models/MentorFeedback');
const Settings = require('../models/Settings');

// ─── GET /api/mentor/feedback ─────────────────────────────────
// Returns the most recent mentor feedback document
router.get('/feedback', async (req, res) => {
  try {
    // Exclude any __probe__ entries that were accidentally saved
    const feedback = await MentorFeedback.findOne({
      message: { $ne: '__probe__' }
    }).sort({ createdAt: -1 });

    // Return null data if no real feedback exists — no hardcoded fallback
    res.json({ success: true, data: feedback || null });
  } catch (error) {
    console.error('GET /api/mentor/feedback error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching mentor feedback' });
  }
});

// ─── POST /api/mentor/verify ──────────────────────────────────
// Verifies the mentor code WITHOUT saving anything.
// Used by the frontend unlock flow.
router.post('/verify', async (req, res) => {
  try {
    const { mentorCode } = req.body;

    const settings = await Settings.findById('app_settings');
    const storedCode = settings?.mentorCode || '786';

    if (!mentorCode || mentorCode !== storedCode) {
      return res.status(403).json({ success: false, message: 'Incorrect mentor code' });
    }

    res.json({ success: true, message: 'Code verified' });
  } catch (error) {
    console.error('POST /api/mentor/verify error:', error.message);
    res.status(500).json({ success: false, message: 'Server error verifying code' });
  }
});

// ─── POST /api/mentor/feedback ────────────────────────────────
// Creates a new mentor feedback entry
// Requires the mentor code in the request body for verification
router.post('/feedback', async (req, res) => {
  try {
    const { message, mentorName, mentorCode } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Feedback message is required' });
    }

    // Verify mentor code against the stored settings
    const settings = await Settings.findById('app_settings');
    const storedCode = settings?.mentorCode || '786';

    if (!mentorCode || mentorCode !== storedCode) {
      return res.status(403).json({ success: false, message: 'Incorrect mentor code' });
    }

    const feedback = await MentorFeedback.create({
      message,
      mentorName: mentorName || 'Ahmed',
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('POST /api/mentor/feedback error:', error.message);
    res.status(500).json({ success: false, message: 'Server error saving mentor feedback' });
  }
});

// ─── PATCH /api/mentor/feedback/:id ──────────────────────────
// Edit an existing feedback message — requires mentor code
router.patch('/feedback/:id', async (req, res) => {
  try {
    const { message, mentorCode } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const settings = await Settings.findById('app_settings');
    const storedCode = settings?.mentorCode || '786';

    if (!mentorCode || mentorCode !== storedCode) {
      return res.status(403).json({ success: false, message: 'Incorrect mentor code' });
    }

    const feedback = await MentorFeedback.findByIdAndUpdate(
      req.params.id,
      { $set: { message } },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('PATCH /api/mentor/feedback/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating feedback' });
  }
});

// ─── DELETE /api/mentor/feedback/:id ─────────────────────────
// Delete a feedback entry — requires mentor code
router.delete('/feedback/:id', async (req, res) => {
  try {
    const { mentorCode } = req.body;

    const settings = await Settings.findById('app_settings');
    const storedCode = settings?.mentorCode || '786';

    if (!mentorCode || mentorCode !== storedCode) {
      return res.status(403).json({ success: false, message: 'Incorrect mentor code' });
    }

    const feedback = await MentorFeedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    console.error('DELETE /api/mentor/feedback/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting feedback' });
  }
});

module.exports = router;
