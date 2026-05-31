const express = require('express');
const router = express.Router();
const StudyTask        = require('../models/StudyTask');
const StudyReflection  = require('../models/StudyReflection');
const MentorFeedback   = require('../models/MentorFeedback');
const QuranProgress    = require('../models/QuranProgress');
const QuranPlan        = require('../models/QuranPlan');
const QuranReflection  = require('../models/QuranReflection');
const SalahRecord      = require('../models/SalahRecord');

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

function localKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── GET /api/journal?days=30 ─────────────────────────────────
// Returns a day-by-day journal for the last N days (default 30).
// Each day entry contains: study tasks, reflection, quran progress,
// quran plan items, quran reflection, salah record, mentor feedback.
// Days with no data at all are omitted to keep the response clean.
router.get('/', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 90); // cap at 90

    // Build date range
    const endDate   = endOfDay(new Date());
    const startDate = startOfDay(new Date());
    startDate.setDate(startDate.getDate() - (days - 1));

    // Fetch everything in parallel — 7 queries total
    const [
      tasks,
      reflections,
      quranProgress,
      quranPlans,
      quranReflections,
      salahRecords,
      mentorFeedbacks,
    ] = await Promise.all([
      StudyTask.find({ date: { $gte: startDate, $lte: endDate }, isForTomorrow: false })
        .sort({ createdAt: 1 }).lean(),

      StudyReflection.find({ date: { $gte: startDate, $lte: endDate } }).lean(),

      QuranProgress.find({ date: { $gte: startDate, $lte: endDate } }).lean(),

      QuranPlan.find({ date: { $gte: startDate, $lte: endDate } })
        .sort({ createdAt: 1 }).lean(),

      QuranReflection.find({ date: { $gte: startDate, $lte: endDate } }).lean(),

      SalahRecord.find({ date: { $gte: startDate, $lte: endDate } }).lean(),

      MentorFeedback.find({ createdAt: { $gte: startDate, $lte: endDate }, message: { $ne: '__probe__' } })
        .sort({ createdAt: -1 }).lean(),
    ]);

    // Group everything by local date key
    function groupByDay(items, dateField = 'date') {
      const map = {};
      items.forEach(item => {
        const key = localKey(item[dateField]);
        if (!map[key]) map[key] = [];
        map[key].push(item);
      });
      return map;
    }

    function singleByDay(items, dateField = 'date') {
      const map = {};
      items.forEach(item => {
        const key = localKey(item[dateField]);
        map[key] = item; // last one wins (there should only be one per day)
      });
      return map;
    }

    const tasksByDay        = groupByDay(tasks);
    const reflectionByDay   = singleByDay(reflections);
    const quranByDay        = singleByDay(quranProgress);
    const quranPlanByDay    = groupByDay(quranPlans);
    const quranRefByDay     = singleByDay(quranReflections);
    const salahByDay        = singleByDay(salahRecords);
    const mentorByDay       = groupByDay(mentorFeedbacks, 'createdAt');

    // Build the journal entries — one per day, most recent first
    const journal = [];

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = localKey(d);

      const dayTasks       = tasksByDay[key]      || [];
      const dayReflection  = reflectionByDay[key] || null;
      const dayQuran       = quranByDay[key]       || null;
      const dayQuranPlan   = quranPlanByDay[key]   || [];
      const dayQuranRef    = quranRefByDay[key]    || null;
      const daySalah       = salahByDay[key]       || null;
      const dayMentor      = mentorByDay[key]      || [];

      // Skip days with absolutely no data
      const hasData =
        dayTasks.length > 0 ||
        dayReflection ||
        dayQuran ||
        dayQuranPlan.length > 0 ||
        dayQuranRef ||
        daySalah ||
        dayMentor.length > 0;

      if (!hasData) continue;

      // Compute summary stats for the day
      const tasksCompleted  = dayTasks.filter(t => t.completed).length;
      const salahCompleted  = daySalah ? daySalah.prayers.filter(p => p.completed).length : 0;
      const salahJamaah     = daySalah ? daySalah.prayers.filter(p => p.jamaah).length    : 0;

      journal.push({
        date:        d.toISOString(),
        dateLabel:   formatDateLabel(d),
        dateKey:     key,
        summary: {
          tasksCompleted,
          tasksTotal:    dayTasks.length,
          quranPages:    dayQuran?.pagesRead       || 0,
          quranTarget:   dayQuran?.targetPages     || 5,
          quranDone:     dayQuran?.dailyPortionDone || false,
          salahCompleted,
          salahJamaah,
        },
        study: {
          tasks:      dayTasks,
          reflection: dayReflection,
        },
        quran: {
          progress:   dayQuran,
          plan:       dayQuranPlan,
          reflection: dayQuranRef,
        },
        salah: {
          record: daySalah,
        },
        mentor: {
          feedbacks: dayMentor,
        },
      });
    }

    res.json({ success: true, data: journal });
  } catch (error) {
    console.error('GET /api/journal error:', error.message);
    console.error(error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
