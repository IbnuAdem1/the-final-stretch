const express = require('express');
const router = express.Router();
const SalahRecord = require('../models/SalahRecord');

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Helpers ──────────────────────────────────────────────────
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

// Use range queries instead of exact date match — tolerates UTC vs local midnight mismatch
function todayRange() {
  return { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) };
}

function dayRange(date) {
  return { $gte: startOfDay(date), $lte: endOfDay(date) };
}

// ─── GET /api/salah/stats?range=week ─────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(startOfDay(d));
    }

    // Wide range query — fetch all records in the 7-day window
    const records = await SalahRecord.find({
      date: { $gte: startOfDay(days[0]), $lte: endOfDay(days[days.length - 1]) },
    }).lean();

    // Match records to days using local date string (tolerates UTC offset)
    function localKey(date) {
      const d = new Date(date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }

    const recordMap = {};
    records.forEach(r => { recordMap[localKey(r.date)] = r; });

    const stats = days.map(day => {
      const record = recordMap[localKey(day)];
      return {
        day:       DAY_ABBR[day.getDay()],
        completed: record ? record.prayers.filter(p => p.completed).length : 0,
        jamaah:    record ? record.prayers.filter(p => p.jamaah).length    : 0,
      };
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('GET /api/salah/stats error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching salah stats' });
  }
});

// ─── GET /api/salah?date=today ────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // Range query — finds record regardless of whether it was saved with UTC or local midnight
    let record = await SalahRecord.findOne({ date: todayRange() });

    if (!record) {
      record = await SalahRecord.create({
        date: startOfDay(new Date()),
        prayers: SalahRecord.freshPrayers(),
      });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('GET /api/salah error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching salah record' });
  }
});

// ─── POST /api/salah ──────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { prayers } = req.body;

    if (!prayers || !Array.isArray(prayers)) {
      return res.status(400).json({ success: false, message: 'prayers array is required' });
    }

    const today = startOfDay(new Date());

    const record = await SalahRecord.findOneAndUpdate(
      { date: todayRange() },
      { $set: { date: today, prayers } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('POST /api/salah error:', error.message);
    res.status(500).json({ success: false, message: 'Server error saving salah record' });
  }
});

module.exports = router;
