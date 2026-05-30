import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Moon, Flame, Users } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { DailyReminderCard, HadithCard } from '../components/IslamicCard';
import WeeklyBar from '../components/WeeklyBar';
import { getDailyIndex } from '../utils/helpers';
import { prayersData, weeklySalahStats, quranVerses, hadiths } from '../data/mockData';

// Score display ring (simple)
function ScoreDisplay({ score, total, label, color = 'emerald' }) {
  const colorMap = {
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  };
  return (
    <div className={`rounded-2xl border p-4 text-center ${colorMap[color]}`}>
      <p className="text-3xl font-bold">
        {score}<span className="text-lg text-slate-500">/{total}</span>
      </p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  );
}

// Individual prayer row
function PrayerRow({ prayer, onToggle, onToggleJamaah, onNoteChange }) {
  const [showNote, setShowNote] = useState(false);

  return (
    <motion.div
      layout
      className="rounded-xl border border-slate-800/50 bg-slate-800/30 overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        {/* Prayer name & time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-200 text-sm">{prayer.name}</p>
            <span className="text-xs text-slate-600">{prayer.time}</span>
          </div>
        </div>

        {/* Prayed checkbox */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onToggle(prayer.id)}
            className="transition-transform active:scale-90"
          >
            {prayer.completed
              ? <CheckCircle2 size={22} className="text-emerald-500" />
              : <Circle size={22} className="text-slate-600 hover:text-emerald-500 transition-colors" />
            }
          </button>
          <span className="text-[9px] text-slate-600">Prayed</span>
        </div>

        {/* Jama'ah checkbox */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onToggleJamaah(prayer.id)}
            disabled={!prayer.completed}
            className={`transition-transform active:scale-90 ${!prayer.completed ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            {prayer.jamaah
              ? <CheckCircle2 size={22} className="text-amber-400" />
              : <Circle size={22} className="text-slate-600 hover:text-amber-400 transition-colors" />
            }
          </button>
          <span className="text-[9px] text-slate-600">Jama'ah</span>
        </div>

        {/* Note toggle */}
        <button
          onClick={() => setShowNote(s => !s)}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>

      {/* Optional notes */}
      {showNote && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4 border-t border-slate-700/30"
        >
          <input
            value={prayer.notes}
            onChange={e => onNoteChange(prayer.id, e.target.value)}
            placeholder={`Notes for ${prayer.name}...`}
            className="w-full mt-3 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Salah() {
  // TODO: GET salah data from backend — GET /api/salah?date=today
  const [prayers, setPrayers] = useState(prayersData);
  const dailyVerseIndex = getDailyIndex(quranVerses);
  const dailyHadithIndex = getDailyIndex(hadiths);

  const completedCount = prayers.filter(p => p.completed).length;
  const jamaahCount = prayers.filter(p => p.jamaah).length;

  function togglePrayer(id) {
    // TODO: Save Salah data — POST /api/salah
    setPrayers(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, completed: !p.completed, jamaah: !p.completed ? p.jamaah : false }
          : p
      )
    );
  }

  function toggleJamaah(id) {
    // TODO: Save Jama'ah attendance — POST /api/salah/jamaah
    setPrayers(prev =>
      prev.map(p => p.id === id ? { ...p, jamaah: !p.jamaah } : p)
    );
  }

  function updateNote(id, note) {
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, notes: note } : p));
  }

  function saveSalah() {
    // TODO: Save Salah data — POST /api/salah
    alert('Salah data saved (mock). TODO: Connect to backend.');
  }

  return (
    <PageLayout title="Salah" subtitle="Guard your prayers — they are your foundation">
      <div className="space-y-5">

        {/* Daily reminder */}
        <DailyReminderCard verse={quranVerses[dailyVerseIndex]} />

        {/* Score summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <ScoreDisplay
            score={completedCount}
            total={5}
            label="Prayers Completed"
            color="emerald"
          />
          <ScoreDisplay
            score={jamaahCount}
            total={5}
            label="Prayed in Jama'ah"
            color="amber"
          />
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10"
        >
          <Flame size={20} className="text-orange-400" />
          <div>
            <p className="text-sm font-semibold text-slate-200">21-day Salah streak</p>
            <p className="text-xs text-slate-500">Alhamdulillah — keep protecting your prayers</p>
          </div>
        </motion.div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs text-slate-500">Prayed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-amber-400" />
            <span className="text-xs text-slate-500">Jama'ah</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle size={14} className="text-slate-600" />
            <span className="text-xs text-slate-500">Not yet</span>
          </div>
        </div>

        {/* Prayer rows */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-2"
        >
          {prayers.map((prayer, i) => (
            <motion.div
              key={prayer.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <PrayerRow
                prayer={prayer}
                onToggle={togglePrayer}
                onToggleJamaah={toggleJamaah}
                onNoteChange={updateNote}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Save button */}
        <button
          onClick={saveSalah}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          Save Today's Salah
        </button>

        {/* Weekly statistics */}
        {/* TODO: Fetch weekly salah stats from backend — GET /api/salah/stats?range=week */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-amber-400" />
            <h3 className="font-semibold text-slate-200 text-sm">Weekly Statistics</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-3">Prayers completed per day</p>
              <WeeklyBar
                data={weeklySalahStats}
                valueKey="completed"
                maxValue={5}
                color="#10b981"
                unit="/5"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-3">Jama'ah per day</p>
              <WeeklyBar
                data={weeklySalahStats}
                valueKey="jamaah"
                maxValue={5}
                color="#f59e0b"
                unit="/5"
              />
            </div>
          </div>

          {/* Weekly summary */}
          <div className="mt-4 pt-4 border-t border-slate-800/40 grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Total Prayers', value: weeklySalahStats.reduce((a, d) => a + d.completed, 0), suffix: '/35' },
              { label: 'Jama\'ah', value: weeklySalahStats.reduce((a, d) => a + d.jamaah, 0), suffix: '/35' },
              { label: 'Consistency', value: Math.round((weeklySalahStats.reduce((a, d) => a + d.completed, 0) / 35) * 100), suffix: '%' },
            ].map(({ label, value, suffix }) => (
              <div key={label}>
                <p className="text-lg font-bold text-slate-200">
                  {value}<span className="text-xs text-slate-600">{suffix}</span>
                </p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hadith about Salah */}
        <HadithCard hadith={hadiths[dailyHadithIndex]} />

        {/* Quran verse about Salah */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-emerald-900/20 bg-emerald-950/10 p-5 text-center"
        >
          <p className="font-arabic text-2xl text-emerald-200 leading-loose mb-3" dir="rtl" lang="ar">
            إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا
          </p>
          <p className="font-display text-slate-400 text-sm italic">
            "Indeed, prayer has been decreed upon the believers a decree of specified times."
          </p>
          <p className="text-xs text-emerald-700 mt-2">Surah An-Nisa 4:103</p>
        </motion.div>

      </div>
    </PageLayout>
  );
}
