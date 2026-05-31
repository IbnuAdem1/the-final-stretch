import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Flame, CheckCheck } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { get, post } from '../utils/api';

// ─── Default prayers structure (shown while loading) ─────────
const DEFAULT_PRAYERS = [
  { name: 'Fajr',    completed: false, jamaah: false, notes: '' },
  { name: 'Dhuhr',   completed: false, jamaah: false, notes: '' },
  { name: 'Asr',     completed: false, jamaah: false, notes: '' },
  { name: 'Maghrib', completed: false, jamaah: false, notes: '' },
  { name: 'Isha',    completed: false, jamaah: false, notes: '' },
];

// ─── Inline success toast ─────────────────────────────────────
function SuccessToast({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-sm"
    >
      <CheckCheck size={14} />
      {message}
    </motion.div>
  );
}

// ─── Score display card ───────────────────────────────────────
function ScoreDisplay({ score, total, label, color = 'emerald' }) {
  const colorMap = {
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    amber:   'text-amber-400 border-amber-500/30 bg-amber-500/5',
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

// ─── Individual prayer row ────────────────────────────────────
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
          <p className="font-semibold text-slate-200 text-sm">{prayer.name}</p>
        </div>

        {/* Prayed checkbox */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onToggle(prayer.name)}
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
            onClick={() => onToggleJamaah(prayer.name)}
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
      <AnimatePresence initial={false}>
        {showNote && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-700/30">
              <input
                value={prayer.notes}
                onChange={e => onNoteChange(prayer.name, e.target.value)}
                placeholder={`Notes for ${prayer.name}...`}
                className="w-full mt-3 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Salah() {
  // ── State ─────────────────────────────────────────────────
  const [prayers, setPrayers] = useState(DEFAULT_PRAYERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const completedCount = prayers.filter(p => p.completed).length;
  const jamaahCount   = prayers.filter(p => p.jamaah).length;

  // ── Fetch on mount ────────────────────────────────────────
  useEffect(() => {
    fetchTodaySalah();
  }, []);

  async function fetchTodaySalah() {
    try {
      setLoading(true);
      const res = await get('/salah?date=today');
      if (res?.data?.prayers) {
        setPrayers(res.data.prayers);
      }
    } catch (err) {
      console.warn('Could not fetch salah record:', err.message);
      // Keep DEFAULT_PRAYERS so the UI is still usable offline
    } finally {
      setLoading(false);
    }
  }

  // ── Helper: save the full prayers array to backend ────────
  async function persistPrayers(updatedPrayers) {
    try {
      await post('/salah', { prayers: updatedPrayers });
    } catch (err) {
      console.error('Auto-save salah failed:', err.message);
    }
  }

  // ── Toggle prayer completed (optimistic + auto-save) ──────
  function togglePrayer(name) {
    setPrayers(prev => {
      const updated = prev.map(p =>
        p.name === name
          ? {
              ...p,
              completed: !p.completed,
              // If unchecking prayer, also uncheck jamaah
              jamaah: !p.completed ? p.jamaah : false,
            }
          : p
      );
      persistPrayers(updated);
      return updated;
    });
  }

  // ── Toggle jamaah (optimistic + auto-save) ────────────────
  function toggleJamaah(name) {
    setPrayers(prev => {
      const updated = prev.map(p =>
        p.name === name ? { ...p, jamaah: !p.jamaah } : p
      );
      persistPrayers(updated);
      return updated;
    });
  }

  // ── Update note (local only — saved on "Save" button) ─────
  function updateNote(name, note) {
    setPrayers(prev =>
      prev.map(p => p.name === name ? { ...p, notes: note } : p)
    );
  }

  // ── Manual save button ────────────────────────────────────
  async function saveSalah() {
    setSaving(true);
    try {
      await post('/salah', { prayers });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save salah failed:', err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageLayout title="Salah" subtitle="Guard your prayers — they are your foundation">
      <div className="space-y-5">

        {/* ── Islamic banner (replaces DailyReminderCard) ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-amber-900/30 bg-gradient-to-br from-amber-950/20 to-slate-900 px-5 py-5 text-center"
        >
          <p
            className="font-arabic text-xl text-amber-200 leading-loose mb-2"
            dir="rtl"
            lang="ar"
          >
            إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا
          </p>
          <p className="font-display text-slate-400 text-sm italic">
            "Indeed, prayer has been decreed upon the believers a decree of specified times."
          </p>
          <p className="text-xs text-amber-700 mt-1">Surah An-Nisa 4:103</p>
        </motion.div>

        {/* Score summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <ScoreDisplay score={completedCount} total={5} label="Prayers Completed" color="emerald" />
          <ScoreDisplay score={jamaahCount}    total={5} label="Prayed in Jama'ah"  color="amber"   />
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
            <p className="text-sm font-semibold text-slate-200">Keep your Salah streak alive</p>
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
        {loading ? (
          <LoadingSpinner message="Loading today's prayers..." />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-2"
          >
            {prayers.map((prayer, i) => (
              <motion.div
                key={prayer.name}
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
        )}

        {/* Save button + toast */}
        <div className="space-y-2">
          <AnimatePresence>
            {saved && <SuccessToast message="Salah saved — may Allah accept it!" />}
          </AnimatePresence>
          <button
            onClick={saveSalah}
            disabled={saving || loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : "Save Today's Salah"}
          </button>
        </div>

        {/* Quran verse about Salah — kept as closing reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-emerald-900/20 bg-emerald-950/10 p-5 text-center"
        >
          <p className="font-arabic text-2xl text-emerald-200 leading-loose mb-3" dir="rtl" lang="ar">
            حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ
          </p>
          <p className="font-display text-slate-400 text-sm italic">
            "Maintain with care the [obligatory] prayers and [in particular] the middle prayer."
          </p>
          <p className="text-xs text-emerald-700 mt-2">Surah Al-Baqarah 2:238</p>
        </motion.div>

      </div>
    </PageLayout>
  );
}
