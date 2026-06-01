const express = require('express');
const router = express.Router();
const Settings      = require('../models/Settings');
const StudyTask     = require('../models/StudyTask');
const QuranProgress = require('../models/QuranProgress');
const SalahRecord   = require('../models/SalahRecord');

// ─── Helpers ──────────────────────────────────────────────────
// Use a wide enough window (±12 hours around midnight) to catch records
// regardless of whether they were saved with UTC or local midnight.
// This makes the queries timezone-tolerant.
function dayWindow(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const start = new Date(d.getTime() - 12 * 60 * 60 * 1000); // 12h before local midnight
  const end   = new Date(d.getTime() + 36 * 60 * 60 * 1000); // 36h after  local midnight
  // Clamp end to actual end of day
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return { start, end: endOfDay };
}

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

// Build array of the last N days as { start, end } windows, oldest first
function buildDayWindows(n) {
  const windows = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    windows.push({
      label: startOfDay(d),
      start: startOfDay(d),
      end:   endOfDay(d),
    });
  }
  return windows;
}

// ─── Efficient streak calculation ────────────────────────────
// Fetches last 90 days of data in 3 bulk queries instead of 365 individual ones.
async function calcAllStreaks() {
  const days = buildDayWindows(90); // last 90 days, today included
  const oldest = days[0].start;
  const newest = days[days.length - 1].end;

  // Fetch all data in parallel — 3 queries total
  const [studyTasks, quranDocs, salahDocs] = await Promise.all([
    StudyTask.find({
      date: { $gte: oldest, $lte: newest },
      completed: true,
    }).select('date').lean(),

    QuranProgress.find({
      date: { $gte: oldest, $lte: newest },
    }).select('date dailyPortionDone').lean(),

    SalahRecord.find({
      date: { $gte: oldest, $lte: newest },
    }).select('date prayers').lean(),
  ]);

  // Build sets of day-keys where each category was completed
  // Use a broad key match: check if the record's date falls within the day window
  function toKey(date) {
    const d = new Date(date);
    // Normalize: use local date string
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  const studyDays = new Set(studyTasks.map(t => toKey(t.date)));

  const quranDays = new Set(
    quranDocs.filter(r => r.dailyPortionDone).map(r => toKey(r.date))
  );

  const salahDays = new Set(
    salahDocs
      .filter(r => r.prayers && r.prayers.some(p => p.completed))
      .map(r => toKey(r.date))
  );

  // Count streaks going backwards from yesterday (today excluded)
  function countStreak(daySet) {
    let streak = 0;
    // days array is oldest→newest, so iterate from second-to-last (yesterday) backwards
    for (let i = days.length - 2; i >= 0; i--) {
      const key = toKey(days[i].label);
      if (daySet.has(key)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  return {
    studyStreak: countStreak(studyDays),
    quranStreak: countStreak(quranDays),
    salahStreak: countStreak(salahDays),
  };
}

// ─── GET /api/dashboard ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd   = endOfDay(new Date());

    // Run all queries in parallel for speed
    const [settings, todayTasks, todayQuranDoc, todaySalahDoc, streaks] = await Promise.all([
      Settings.findById('app_settings'),
      StudyTask.find({
        date: { $gte: todayStart, $lte: todayEnd },
      }).lean(),
      QuranProgress.findOne({ date: { $gte: todayStart, $lte: todayEnd } }).lean(),
      SalahRecord.findOne({ date: { $gte: todayStart, $lte: todayEnd } }).lean(),
      calcAllStreaks(),
    ]);

    // ── Exam date ─────────────────────────────────────────
    const examDate = settings?.examDate || new Date('2026-07-01T08:00:00.000Z');

    // ── Today's Study ─────────────────────────────────────
    const studyCompleted = todayTasks.filter(t => t.completed).length;
    const studyTotal     = todayTasks.length;
    const studyPercent   = studyTotal > 0
      ? Math.round((studyCompleted / studyTotal) * 100)
      : 0;

    // ── Today's Quran ─────────────────────────────────────
    const pagesRead    = todayQuranDoc?.pagesRead   || 0;
    const targetPages  = todayQuranDoc?.targetPages || settings?.dailyQuranTarget || 5;
    const quranPercent = Math.round((pagesRead / targetPages) * 100);

    // ── Today's Salah ─────────────────────────────────────
    const salahCompleted = todaySalahDoc
      ? todaySalahDoc.prayers.filter(p => p.completed).length
      : 0;
    const salahPercent = Math.round((salahCompleted / 5) * 100);

    // ── Streaks ───────────────────────────────────────────
    const { studyStreak, quranStreak, salahStreak } = streaks;
    const overallStreak = Math.min(studyStreak, quranStreak, salahStreak);

    res.json({
      success: true,
      data: {
        examDate,
        studyStreak,
        quranStreak,
        salahStreak,
        overallStreak,
        todayStudy: { completed: studyCompleted, total: studyTotal, percent: studyPercent },
        todayQuran: { pagesRead, targetPages, percent: quranPercent },
        todaySalah: { completed: salahCompleted, percent: salahPercent },
      },
    });
  } catch (error) {
    console.error('GET /api/dashboard error:', error.message);
    console.error(error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
