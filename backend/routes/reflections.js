const express = require('express');
const router = express.Router();
const StudyReflection = require('../models/StudyReflection');

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function todayRange() {
  return { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) };
}

// ─── GET /api/reflections?date=today ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const reflection = await StudyReflection.findOne({ date: todayRange() });

    res.json({
      success: true,
      data: reflection || { wentWell: '', distracted: '', improve: '' },
    });
  } catch (error) {
    console.error('GET /api/reflections error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching reflection' });
  }
});

// ─── POST /api/reflections ────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { wentWell, distracted, improve } = req.body;
    const today = startOfDay(new Date());

    const reflection = await StudyReflection.findOneAndUpdate(
      { date: todayRange() },
      { $set: { date: today, wentWell: wentWell || '', distracted: distracted || '', improve: improve || '' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: reflection });
  } catch (error) {
    console.error('POST /api/reflections error:', error.message);
    res.status(500).json({ success: false, message: 'Server error saving reflection' });
  }
});

module.exports = router;
