const express = require('express');
const router = express.Router();
const StudyTask     = require('../models/StudyTask');
const QuranProgress = require('../models/QuranProgress');
const SalahRecord   = require('../models/SalahRecord');

// ─── Helpers ──────────────────────────────────────────────────
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // local midnight
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999); // local end of day
  return d;
}

// Build array of N past days (oldest first, today included)
function buildDayArray(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(startOfDay(d));
  }
  return days;
}

// ─── GET /api/analytics ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const last30 = buildDayArray(30);
    const last7  = buildDayArray(7);

    const rangeStart30 = last30[0];
    const rangeEnd30   = endOfDay(last30[last30.length - 1]);
    const rangeStart7  = last7[0];
    const rangeEnd7    = endOfDay(last7[last7.length - 1]);

    // ── Fetch all data in parallel ────────────────────────
    const [
      tasks30,
      quranDocs30,
      salahDocs30,
      tasks7,
      quranDocs7,
      salahDocs7,
    ] = await Promise.all([
      StudyTask.find({ date: { $gte: rangeStart30, $lte: rangeEnd30 }, isForTomorrow: false }),
      QuranProgress.find({ date: { $gte: rangeStart30, $lte: rangeEnd30 } }),
      SalahRecord.find({ date: { $gte: rangeStart30, $lte: rangeEnd30 } }),
      StudyTask.find({ date: { $gte: rangeStart7, $lte: rangeEnd7 }, isForTomorrow: false }),
      QuranProgress.find({ date: { $gte: rangeStart7, $lte: rangeEnd7 } }),
      SalahRecord.find({ date: { $gte: rangeStart7, $lte: rangeEnd7 } }),
    ]);

    // Build lookup maps keyed by local date (tolerates UTC offset)
    function toKey(date) {
      const d = new Date(date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }

    // Study: group completed tasks by day
    const studyByDay = {};
    tasks30.forEach(t => {
      const k = toKey(t.date);
      if (!studyByDay[k]) studyByDay[k] = { hasCompleted: false, hours: 0 };
      if (t.completed) {
        studyByDay[k].hasCompleted = true;
        studyByDay[k].hours += t.estimatedHours || 0;
      }
    });

    // Quran: map by day
    const quranByDay = {};
    quranDocs30.forEach(r => { quranByDay[toKey(r.date)] = r; });

    // Salah: map by day
    const salahByDay = {};
    salahDocs30.forEach(r => { salahByDay[toKey(r.date)] = r; });

    // ── 30-day consistency % ──────────────────────────────
    let studyDays = 0, quranDays = 0, salahDays = 0;

    last30.forEach(day => {
      const k = toKey(day);
      if (studyByDay[k]?.hasCompleted)                                  studyDays++;
      if (quranByDay[k]?.dailyPortionDone)                              quranDays++;
      if (salahByDay[k]?.prayers?.some(p => p.completed))              salahDays++;
    });

    const studyConsistency = Math.round((studyDays / 30) * 100);
    const quranConsistency = Math.round((quranDays / 30) * 100);
    const salahConsistency = Math.round((salahDays / 30) * 100);

    // ── Weekly study (last 7 days) ────────────────────────
    // Build study map from tasks7
    const studyByDay7 = {};
    tasks7.forEach(t => {
      const k = toKey(t.date);
      if (!studyByDay7[k]) studyByDay7[k] = 0;
      if (t.completed) studyByDay7[k] += t.estimatedHours || 0;
    });

    const weeklyStudy = last7.map(day => ({
      day:   DAY_ABBR[day.getUTCDay()],
      hours: Math.round((studyByDay7[toKey(day)] || 0) * 10) / 10,
    }));

    // ── Weekly Quran (last 7 days) ────────────────────────
    const quranByDay7 = {};
    quranDocs7.forEach(r => { quranByDay7[toKey(r.date)] = r; });

    const weeklyQuran = last7.map(day => ({
      day:   DAY_ABBR[day.getUTCDay()],
      pages: quranByDay7[toKey(day)]?.pagesRead || 0,
    }));

    // ── Weekly Salah (last 7 days) ────────────────────────
    const salahByDay7 = {};
    salahDocs7.forEach(r => { salahByDay7[toKey(r.date)] = r; });

    const weeklySalah = last7.map(day => {
      const record = salahByDay7[toKey(day)];
      return {
        day:       DAY_ABBR[day.getUTCDay()],
        completed: record ? record.prayers.filter(p => p.completed).length : 0,
        jamaah:    record ? record.prayers.filter(p => p.jamaah).length    : 0,
      };
    });

    // ── Monthly study (last 4 weeks) ──────────────────────
    // W1 = oldest week, W4 = most recent
    const monthlyStudy = [0, 1, 2, 3].map(weekOffset => {
      // weekOffset 0 = 4 weeks ago, 3 = this week
      const weekLabel = `W${weekOffset + 1}`;
      let hours = 0;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const daysAgo = (3 - weekOffset) * 7 + (6 - dayOffset);
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const k = toKey(startOfDay(d));
        hours += studyByDay[k]?.hours || 0;
      }

      return { week: weekLabel, hours: Math.round(hours * 10) / 10 };
    });

    res.json({
      success: true,
      data: {
        studyConsistency,
        quranConsistency,
        salahConsistency,
        weeklyStudy,
        weeklyQuran,
        weeklySalah,
        monthlyStudy,
      },
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
});

module.exports = router;
