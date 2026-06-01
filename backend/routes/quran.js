const express = require('express');
const router = express.Router();
const QuranProgress   = require('../models/QuranProgress');
const QuranPlan       = require('../models/QuranPlan');
const QuranReflection = require('../models/QuranReflection');
const Settings        = require('../models/Settings');

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

// Range query — tolerates UTC vs local midnight mismatch in stored dates
function todayRange() {
  return { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) };
}

function tomorrowRange() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return { $gte: startOfDay(d), $lte: endOfDay(d) };
}

function startOfTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Local date key for grouping — tolerates timezone offset
function localKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ─── Efficient streak calculation (bulk fetch, no loop queries) ──
async function calculateStreak() {
  // Fetch last 90 days of quran progress in one query
  const since = new Date();
  since.setDate(since.getDate() - 90);
  since.setHours(0, 0, 0, 0);

  const records = await QuranProgress.find({
    date: { $gte: since },
    dailyPortionDone: true,
  }).select('date').lean();

  const doneDays = new Set(records.map(r => localKey(r.date)));

  // Count consecutive days backwards from yesterday
  let streak = 0;
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 1); // start from yesterday

  for (let i = 0; i < 90; i++) {
    if (doneDays.has(localKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ─── GET /api/quran/stats ─────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(startOfDay(d));
    }

    const records = await QuranProgress.find({
      date: { $gte: startOfDay(days[0]), $lte: endOfDay(days[days.length - 1]) },
    }).lean();

    const recordMap = {};
    records.forEach(r => { recordMap[localKey(r.date)] = r; });

    const stats = days.map(day => ({
      day:   DAY_ABBR[day.getDay()],
      pages: recordMap[localKey(day)]?.pagesRead || 0,
    }));

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('GET /api/quran/stats error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching quran stats' });
  }
});

// ─── GET /api/quran/progress?date=today ───────────────────────
router.get('/progress', async (req, res) => {
  try {
    const settings = await Settings.findById('app_settings');
    const targetPages = settings?.dailyQuranTarget || null;

    let progress = await QuranProgress.findOne({ date: todayRange() });

    if (!progress) {
      // Check if a QuranPlan exists for today — if so, bridge it into today's progress
      const todayPlans = await QuranPlan.find({ date: todayRange() }).sort({ createdAt: 1 });
      const firstPlan  = todayPlans[0] || null;

      progress = await QuranProgress.create({
        date:             startOfDay(new Date()),
        pagesRead:        0,
        targetPages:      targetPages,
        dailyPortionDone: false,
        surah:            firstPlan?.surah    || '',
        fromPage:         firstPlan?.fromPage || 0,
        toPage:           firstPlan?.toPage   || 0,
      });
    } else {
      // Sync targetPages from Settings on every fetch
      // Also bridge plan data if surah is still empty but a plan now exists for today
      const needsPlanBridge = !progress.surah;
      const updateData = { targetPages };

      if (needsPlanBridge) {
        const todayPlans = await QuranPlan.find({ date: todayRange() }).sort({ createdAt: 1 });
        const firstPlan  = todayPlans[0] || null;
        if (firstPlan) {
          updateData.surah    = firstPlan.surah;
          updateData.fromPage = firstPlan.fromPage;
          updateData.toPage   = firstPlan.toPage;
        }
      }

      progress = await QuranProgress.findByIdAndUpdate(
        progress._id,
        { $set: updateData },
        { new: true }
      );
    }

    const streak = await calculateStreak();
    res.json({ success: true, data: { ...progress.toObject(), streak } });
  } catch (error) {
    console.error('GET /api/quran/progress error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching quran progress' });
  }
});

// ─── POST /api/quran/progress ─────────────────────────────────
router.post('/progress', async (req, res) => {
  try {
    const { pagesRead, dailyPortionDone, surah, fromPage, toPage } = req.body;

    const updateData = {};
    if (pagesRead        !== undefined) updateData.pagesRead        = pagesRead;
    if (dailyPortionDone !== undefined) updateData.dailyPortionDone = dailyPortionDone;
    if (surah            !== undefined) updateData.surah            = surah;
    if (fromPage         !== undefined) updateData.fromPage         = fromPage;
    if (toPage           !== undefined) updateData.toPage           = toPage;

    const settings = await Settings.findById('app_settings');
    const targetPages = settings?.dailyQuranTarget || null;

    const progress = await QuranProgress.findOneAndUpdate(
      { date: todayRange() },
      { $set: { date: startOfDay(new Date()), targetPages, ...updateData } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const streak = await calculateStreak();
    res.json({ success: true, data: { ...progress.toObject(), streak } });
  } catch (error) {
    console.error('POST /api/quran/progress error:', error.message);
    res.status(500).json({ success: false, message: 'Server error saving quran progress' });
  }
});

// ─── GET /api/quran/plan?date=tomorrow ────────────────────────
router.get('/plan', async (req, res) => {
  try {
    const plan = await QuranPlan.find({ date: tomorrowRange() }).sort({ createdAt: 1 });
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('GET /api/quran/plan error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching quran plan' });
  }
});

// ─── POST /api/quran/plan ─────────────────────────────────────
router.post('/plan', async (req, res) => {
  try {
    const { surah, fromPage, toPage, notes } = req.body;

    if (!surah || !fromPage || !toPage) {
      return res.status(400).json({ success: false, message: 'surah, fromPage, and toPage are required' });
    }

    const item = await QuranPlan.create({
      date:     startOfTomorrow(),
      surah,
      fromPage: parseInt(fromPage),
      toPage:   parseInt(toPage),
      notes:    notes || '',
      done:     false,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('POST /api/quran/plan error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating quran plan item' });
  }
});

// ─── PATCH /api/quran/plan/:id ────────────────────────────────
router.patch('/plan/:id', async (req, res) => {
  try {
    const item = await QuranPlan.findByIdAndUpdate(
      req.params.id,
      { $set: { done: req.body.done } },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Plan item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('PATCH /api/quran/plan/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating quran plan item' });
  }
});

// ─── DELETE /api/quran/plan/:id ───────────────────────────────
router.delete('/plan/:id', async (req, res) => {
  try {
    const item = await QuranPlan.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Plan item not found' });
    res.json({ success: true, message: 'Plan item deleted' });
  } catch (error) {
    console.error('DELETE /api/quran/plan/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting quran plan item' });
  }
});

// ─── POST /api/quran/reflection ───────────────────────────────
router.post('/reflection', async (req, res) => {
  try {
    const { ayah, lesson } = req.body;

    const reflection = await QuranReflection.findOneAndUpdate(
      { date: todayRange() },
      { $set: { date: startOfDay(new Date()), ayah: ayah || '', lesson: lesson || '' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: reflection });
  } catch (error) {
    console.error('POST /api/quran/reflection error:', error.message);
    res.status(500).json({ success: false, message: 'Server error saving quran reflection' });
  }
});

module.exports = router;
