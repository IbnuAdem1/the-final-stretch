import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flame, BookMarked, Star } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { QuranVerseCard, DailyReminderCard } from '../components/IslamicCard';
import ProgressRing from '../components/ProgressRing';
import WeeklyBar from '../components/WeeklyBar';
import { getPercentage, getDailyIndex } from '../utils/helpers';
import { quranProgress, quranVerses } from '../data/mockData';

// Beautiful Arabic typography display
function ArabicTypographySection() {
  const verses = [
    {
      arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      translation: 'Read in the name of your Lord who created.',
      ref: 'Al-Alaq 96:1',
    },
    {
      arabic: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
      translation: 'And recite the Quran with measured recitation.',
      ref: 'Al-Muzzammil 73:4',
    },
  ];

  return (
    <div className="rounded-2xl border border-emerald-900/30 bg-gradient-to-br from-emerald-950/30 to-slate-900 p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BookMarked size={14} className="text-emerald-500" />
        <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider">
          Beautiful Recitation
        </p>
      </div>
      {verses.map((v, i) => (
        <div key={i} className={i > 0 ? 'border-t border-emerald-900/30 pt-5' : ''}>
          <p
            className="font-arabic text-3xl text-emerald-100 text-right leading-loose mb-3"
            dir="rtl"
            lang="ar"
          >
            {v.arabic}
          </p>
          <p className="font-display text-slate-400 text-sm italic text-center">"{v.translation}"</p>
          <p className="text-xs text-emerald-700 text-center mt-1">{v.ref}</p>
        </div>
      ))}
    </div>
  );
}

// Consistency badge
function ConsistencyBadge({ label, value, color = 'emerald' }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-center ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{value}%</p>
      <p className="text-xs mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

export default function Quran() {
  // TODO: GET Quran progress from backend — GET /api/quran/progress
  const [pagesRead, setPagesRead] = useState(quranProgress.todayCompleted);
  const [goalCompleted, setGoalCompleted] = useState(false);
  const [reflection, setReflection] = useState({ ayah: '', lesson: '' });
  const dailyVerseIndex = getDailyIndex(quranVerses);

  const percent = getPercentage(pagesRead, quranProgress.todayTarget);

  function markPage() {
    if (pagesRead < quranProgress.todayTarget) {
      const next = pagesRead + 1;
      setPagesRead(next);
      if (next >= quranProgress.todayTarget) setGoalCompleted(true);
      // TODO: Save Quran progress — POST /api/quran/progress
    }
  }

  function saveReflection() {
    // TODO: Save Quran reflection — POST /api/quran/reflection
    alert('Quran reflection saved (mock). TODO: Connect to backend.');
  }

  return (
    <PageLayout title="Quran" subtitle="Daily consistency with the Book of Allah">
      <div className="space-y-5">

        {/* Daily reminder */}
        <DailyReminderCard verse={quranVerses[(dailyVerseIndex + 2) % quranVerses.length]} />

        {/* Today's goal card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-slate-900 to-emerald-950/20 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-1">
                Today's Goal
              </p>
              <h3 className="text-2xl font-bold text-slate-100">{quranProgress.todayGoal}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {pagesRead} of {quranProgress.todayTarget} pages read
              </p>
            </div>
            <ProgressRing
              percentage={percent}
              size={80}
              strokeWidth={7}
              color="#10b981"
            />
          </div>

          {/* Page progress dots */}
          <div className="flex gap-2 flex-wrap mb-5">
            {Array.from({ length: quranProgress.todayTarget }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium border transition-all ${
                  i < pagesRead
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-800/60 border-slate-700/40 text-slate-600'
                }`}
              >
                {i + 1}
              </motion.div>
            ))}
          </div>

          {/* Mark page button */}
          {goalCompleted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full py-3 rounded-xl bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              Goal Complete — Alhamdulillah!
            </motion.div>
          ) : (
            <button
              onClick={markPage}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              Mark Page {pagesRead + 1} as Read
            </button>
          )}
        </motion.div>

        {/* Streak & consistency */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} className="text-orange-400" />
            <h3 className="font-semibold text-slate-200 text-sm">Streak & Consistency</h3>
          </div>

          {/* Current streak */}
          <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
            <div className="text-3xl font-bold text-orange-400">{quranProgress.currentStreak}</div>
            <div>
              <p className="text-sm font-medium text-slate-300">Day Streak</p>
              <p className="text-xs text-slate-500">Keep going, don't break the chain</p>
            </div>
          </div>

          {/* Consistency badges */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <ConsistencyBadge label="Weekly" value={92} color="emerald" />
            <ConsistencyBadge label="Monthly" value={quranProgress.monthlyConsistency} color="blue" />
            <ConsistencyBadge label="Overall" value={89} color="amber" />
          </div>

          {/* Weekly bar chart */}
          <div>
            <p className="text-xs text-slate-500 mb-3">Pages this week</p>
            <WeeklyBar
              data={quranProgress.weeklyData}
              valueKey="pages"
              maxValue={5}
              color="#10b981"
              unit=" pages"
            />
          </div>
        </motion.div>

        {/* Quran Reflection */}
        {/* TODO: Save Quran reflection — POST /api/quran/reflection */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-amber-400" />
            <h3 className="font-semibold text-slate-200 text-sm">Quran Reflection</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Which ayah impacted you today?
              </label>
              <textarea
                value={reflection.ayah}
                onChange={e => setReflection(p => ({ ...p, ayah: e.target.value }))}
                placeholder="Write the ayah or its reference..."
                rows={2}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 focus:ring-1 focus:ring-emerald-700/30 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                What lesson did you take?
              </label>
              <textarea
                value={reflection.lesson}
                onChange={e => setReflection(p => ({ ...p, lesson: e.target.value }))}
                placeholder="The lesson I reflected on today..."
                rows={3}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 focus:ring-1 focus:ring-emerald-700/30 transition-colors resize-none"
              />
            </div>
            <button
              onClick={saveReflection}
              className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-400 text-sm font-medium transition-colors"
            >
              Save Reflection
            </button>
          </div>
        </motion.div>

        {/* Arabic typography section */}
        <ArabicTypographySection />

        {/* Daily Quran verse card */}
        {/* TODO: Fetch daily Quran verse from backend */}
        <QuranVerseCard verse={quranVerses[dailyVerseIndex]} />

        {/* Daily reminder card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-emerald-900/20 bg-emerald-950/10 p-4 text-center"
        >
          <p className="font-arabic text-lg text-emerald-300 mb-2" dir="rtl" lang="ar">
            خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
          </p>
          <p className="text-xs text-slate-500 italic font-display">
            "The best of you are those who learn the Quran and teach it." — Bukhari
          </p>
        </motion.div>

      </div>
    </PageLayout>
  );
}
