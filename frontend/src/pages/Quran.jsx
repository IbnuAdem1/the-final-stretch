import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, Flame, BookMarked, Star,
  Plus, Trash2, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { QuranVerseCard, DailyReminderCard } from '../components/IslamicCard';
import ProgressRing from '../components/ProgressRing';
import WeeklyBar from '../components/WeeklyBar';
import { getPercentage, getDailyIndex } from '../utils/helpers';
import { quranProgress, quranVerses } from '../data/mockData';

// ─── Collapsible Section ──────────────────────────────────────
function Section({ title, subtitle, icon: Icon, iconColor = 'text-emerald-400', children, defaultOpen = true, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 rounded-lg bg-slate-800/60 ${iconColor}`}>
              <Icon size={14} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-200 text-sm">{title}</h3>
              {badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={15} className="text-slate-500 flex-shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-800/40">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Consistency Badge ────────────────────────────────────────
function ConsistencyBadge({ label, value, color = 'emerald' }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  return (
    <div className={`rounded-xl border px-3 py-3 text-center ${colorMap[color]}`}>
      <p className="text-xl font-bold">{value}%</p>
      <p className="text-xs mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

// ─── Tomorrow Plan Item ───────────────────────────────────────
function PlanItem({ item, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
        item.done
          ? 'bg-emerald-950/20 border-emerald-900/30 opacity-70'
          : 'bg-slate-800/40 border-slate-700/30'
      }`}
    >
      <button onClick={() => onToggle(item.id)} className="mt-0.5 flex-shrink-0">
        {item.done
          ? <CheckCircle2 size={18} className="text-emerald-500" />
          : <Circle size={18} className="text-slate-600 hover:text-emerald-500 transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {item.surah}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Page {item.fromPage} → Page {item.toPage}
          <span className="ml-2 text-emerald-700">({item.toPage - item.fromPage + 1} pages)</span>
        </p>
        {item.notes && <p className="text-xs text-slate-600 mt-1 italic">"{item.notes}"</p>}
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

// ─── Mock tomorrow plan data ──────────────────────────────────
const INITIAL_PLAN = [
  { id: 1, surah: 'Surah Al-Baqarah', fromPage: 6, toPage: 10, notes: 'Focus on ayat al-kursi', done: false },
  { id: 2, surah: 'Surah Al-Imran', fromPage: 50, toPage: 53, notes: '', done: false },
];

export default function Quran() {
  // TODO: GET Quran progress from backend — GET /api/quran/progress
  const [pagesRead, setPagesRead] = useState(quranProgress.todayCompleted);
  const [dailyPortionDone, setDailyPortionDone] = useState(false);
  const [reflection, setReflection] = useState({ ayah: '', lesson: '' });
  const dailyVerseIndex = getDailyIndex(quranVerses);

  // Tomorrow's plan state
  // TODO: GET tomorrow's Quran plan — GET /api/quran/plan?date=tomorrow
  const [plan, setPlan] = useState(INITIAL_PLAN);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ surah: '', fromPage: '', toPage: '', notes: '' });

  const percent = getPercentage(pagesRead, quranProgress.todayTarget);
  const goalCompleted = pagesRead >= quranProgress.todayTarget;
  const planDoneCount = plan.filter(p => p.done).length;

  function markPage() {
    if (pagesRead < quranProgress.todayTarget) {
      // TODO: Save Quran progress — POST /api/quran/progress
      setPagesRead(p => p + 1);
    }
  }

  function addPlanItem() {
    if (!newItem.surah || !newItem.fromPage || !newItem.toPage) return;
    // TODO: Create Quran plan task — POST /api/quran/plan
    setPlan(prev => [
      ...prev,
      {
        id: Date.now(),
        surah: newItem.surah,
        fromPage: parseInt(newItem.fromPage),
        toPage: parseInt(newItem.toPage),
        notes: newItem.notes,
        done: false,
      },
    ]);
    setNewItem({ surah: '', fromPage: '', toPage: '', notes: '' });
    setShowForm(false);
  }

  function togglePlanItem(id) {
    // TODO: Update Quran plan task — PATCH /api/quran/plan/:id
    setPlan(prev => prev.map(p => p.id === id ? { ...p, done: !p.done } : p));
  }

  function deletePlanItem(id) {
    // TODO: Delete Quran plan task — DELETE /api/quran/plan/:id
    setPlan(prev => prev.filter(p => p.id !== id));
  }

  function saveReflection() {
    // TODO: Save Quran reflection — POST /api/quran/reflection
    alert('Reflection saved (mock). TODO: Connect to backend.');
  }

  return (
    <PageLayout title="Quran" subtitle="Daily consistency with the Book of Allah">
      <div className="space-y-4">

        {/* Daily reminder */}
        <DailyReminderCard verse={quranVerses[(dailyVerseIndex + 2) % quranVerses.length]} />

        {/* ── SECTION 1: Daily Portion (non-skippable) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`rounded-2xl border-2 p-5 transition-all duration-500 ${
            dailyPortionDone
              ? 'border-emerald-600/50 bg-gradient-to-br from-emerald-950/30 to-slate-900'
              : 'border-emerald-900/60 bg-gradient-to-br from-slate-900 to-emerald-950/20'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={13} className="text-emerald-500" />
                <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">
                  Daily Portion — Do Not Skip
                </p>
              </div>
              <h3 className="text-lg font-bold text-slate-100">Today's Quran Reading</h3>
              <p className="text-sm text-slate-400 mt-0.5">Surah Al-Baqarah · Page 2 → Page 6</p>
            </div>
            <ProgressRing percentage={percent} size={72} strokeWidth={6} color="#10b981" />
          </div>

          {/* Page progress dots */}
          <div className="flex gap-2 flex-wrap mb-5">
            {Array.from({ length: quranProgress.todayTarget }).map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  if (i === pagesRead && pagesRead < quranProgress.todayTarget) markPage();
                }}
                whileTap={{ scale: 0.9 }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold border transition-all ${
                  i < pagesRead
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                    : i === pagesRead
                    ? 'bg-slate-800 border-emerald-700/50 text-emerald-400 ring-1 ring-emerald-700/40'
                    : 'bg-slate-800/40 border-slate-700/30 text-slate-600'
                }`}
              >
                {i < pagesRead ? <CheckCircle2 size={14} /> : i + 1}
              </motion.button>
            ))}
          </div>

          <p className="text-xs text-slate-500 mb-4">
            {pagesRead} of {quranProgress.todayTarget} pages read today
          </p>

          {/* Daily portion checkbox */}
          <div
            onClick={() => setDailyPortionDone(d => !d)}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all mb-4 ${
              dailyPortionDone
                ? 'bg-emerald-600/15 border-emerald-600/40'
                : 'bg-slate-800/40 border-slate-700/30 hover:border-emerald-800/50'
            }`}
          >
            {dailyPortionDone
              ? <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
              : <Circle size={20} className="text-slate-600 flex-shrink-0" />
            }
            <div>
              <p className={`text-sm font-medium ${dailyPortionDone ? 'text-emerald-400 line-through' : 'text-slate-200'}`}>
                I completed my daily Quran portion
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {dailyPortionDone ? 'Alhamdulillah — may Allah accept it' : 'Tap to mark as complete'}
              </p>
            </div>
          </div>

          {/* Mark page button */}
          {!goalCompleted ? (
            <button
              onClick={markPage}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={15} />
              Mark Page {pagesRead + 1} as Read
            </button>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full py-3 rounded-xl bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={15} />
              Goal Complete — Alhamdulillah!
            </motion.div>
          )}
        </motion.div>

        {/* ── SECTION 2: Tomorrow's Quran Plan ── */}
        {/* TODO: GET tomorrow's Quran plan — GET /api/quran/plan?date=tomorrow */}
        {/* TODO: Create Quran plan task — POST /api/quran/plan */}
        {/* TODO: Delete Quran plan task — DELETE /api/quran/plan/:id */}
        <Section
          title="Tomorrow's Reading Plan"
          subtitle="Plan what you will read tomorrow"
          icon={BookMarked}
          iconColor="text-emerald-400"
          badge={plan.length > 0 ? `${planDoneCount}/${plan.length}` : undefined}
          defaultOpen={true}
        >
          <div className="space-y-3 mt-3">
            <AnimatePresence>
              {plan.map(item => (
                <PlanItem
                  key={item.id}
                  item={item}
                  onToggle={togglePlanItem}
                  onDelete={deletePlanItem}
                />
              ))}
            </AnimatePresence>

            {plan.length === 0 && !showForm && (
              <p className="text-sm text-slate-600 text-center py-3 italic">
                No reading planned yet for tomorrow.
              </p>
            )}

            {/* Add form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 space-y-3 overflow-hidden"
                >
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Surah / Section</label>
                    <input
                      value={newItem.surah}
                      onChange={e => setNewItem(p => ({ ...p, surah: e.target.value }))}
                      placeholder="e.g. Surah Al-Baqarah"
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">From Page</label>
                      <input
                        type="number"
                        value={newItem.fromPage}
                        onChange={e => setNewItem(p => ({ ...p, fromPage: e.target.value }))}
                        placeholder="e.g. 6"
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">To Page</label>
                      <input
                        type="number"
                        value={newItem.toPage}
                        onChange={e => setNewItem(p => ({ ...p, toPage: e.target.value }))}
                        placeholder="e.g. 10"
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Notes (optional)</label>
                    <input
                      value={newItem.notes}
                      onChange={e => setNewItem(p => ({ ...p, notes: e.target.value }))}
                      placeholder="e.g. Focus on tajweed..."
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
                    />
                  </div>
                  {newItem.fromPage && newItem.toPage && parseInt(newItem.toPage) >= parseInt(newItem.fromPage) && (
                    <p className="text-xs text-emerald-600">
                      ✦ {parseInt(newItem.toPage) - parseInt(newItem.fromPage) + 1} pages planned
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={addPlanItem}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                    >
                      Add to Plan
                    </button>
                    <button
                      onClick={() => { setShowForm(false); setNewItem({ surah: '', fromPage: '', toPage: '', notes: '' }); }}
                      className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-emerald-700/50 text-slate-500 hover:text-emerald-400 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Add Reading for Tomorrow
              </button>
            )}
          </div>
        </Section>

        {/* ── SECTION 3: Streak & Consistency ── */}
        <Section
          title="Streak & Consistency"
          subtitle="Keep the chain unbroken"
          icon={Flame}
          iconColor="text-orange-400"
          defaultOpen={true}
        >
          <div className="mt-3 space-y-4">
            {/* Streak */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
              <div className="text-3xl font-bold text-orange-400">{quranProgress.currentStreak}</div>
              <div>
                <p className="text-sm font-medium text-slate-300">Day Streak</p>
                <p className="text-xs text-slate-500">Don't break the chain — keep going</p>
              </div>
            </div>

            {/* Consistency badges */}
            <div className="grid grid-cols-3 gap-2">
              <ConsistencyBadge label="Weekly" value={92} color="emerald" />
              <ConsistencyBadge label="Monthly" value={quranProgress.monthlyConsistency} color="blue" />
              <ConsistencyBadge label="Overall" value={89} color="amber" />
            </div>

            {/* Weekly bar */}
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
          </div>
        </Section>

        {/* ── SECTION 4: Reflection ── */}
        {/* TODO: Save Quran reflection — POST /api/quran/reflection */}
        <Section
          title="Today's Reflection"
          subtitle="What did the Quran say to your heart today?"
          icon={Star}
          iconColor="text-amber-400"
          defaultOpen={false}
        >
          <div className="space-y-4 mt-3">
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
        </Section>

        {/* Daily Quran verse */}
        {/* TODO: Fetch daily Quran verse from backend */}
        <QuranVerseCard verse={quranVerses[dailyVerseIndex]} />

        {/* Hadith footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-emerald-900/20 bg-emerald-950/10 p-5 text-center"
        >
          <p className="font-arabic text-xl text-emerald-300 leading-loose mb-2" dir="rtl" lang="ar">
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
