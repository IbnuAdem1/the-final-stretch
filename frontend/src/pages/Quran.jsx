import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, BookMarked, Star,
  Plus, Trash2, AlertCircle, ChevronDown, ChevronUp, CheckCheck, XCircle
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { QuranVerseCard } from '../components/IslamicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressRing from '../components/ProgressRing';
import { getPercentage, getDailyIndex } from '../utils/helpers';
import { get, post, patch, del } from '../utils/api';
import { quranVerses } from '../data/mockData';

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
        {open
          ? <ChevronUp size={15} className="text-slate-500 flex-shrink-0" />
          : <ChevronDown size={15} className="text-slate-500 flex-shrink-0" />
        }
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

// ─── Success toast ────────────────────────────────────────────
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
      <button onClick={() => onToggle(item._id)} className="mt-0.5 flex-shrink-0">
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
        onClick={() => onDelete(item._id)}
        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

export default function Quran() {
  // ── Progress state ────────────────────────────────────────
  const [pagesRead, setPagesRead]               = useState(0);
  const [targetPages, setTargetPages]           = useState(null);
  const [dailyPortionDone, setDailyPortionDone] = useState(false);
  // Daily plan info (surah + page range stored in QuranProgress)
  const [dailySurah, setDailySurah]             = useState('');
  const [dailyFromPage, setDailyFromPage]       = useState(0);
  const [dailyToPage, setDailyToPage]           = useState(0);
  // "Not completed" reason flow
  const [showReasonInput, setShowReasonInput]   = useState(false);
  const [notCompletedReason, setNotCompletedReason] = useState('');

  // ── Plan state ────────────────────────────────────────────
  const [plan, setPlan]       = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ surah: '', fromPage: '', toPage: '', notes: '' });

  // ── Reflection state ──────────────────────────────────────
  const [reflection, setReflection] = useState({ ayah: '', lesson: '' });
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);

  // ── Loading states ────────────────────────────────────────
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [loadingPlan, setLoadingPlan]         = useState(true);

  const dailyVerseIndex = getDailyIndex(quranVerses);
  // Calculate percent:
  // - dailyPortionDone = true  → always 100%
  // - pagesRead > 0            → pagesRead / targetPages
  // - otherwise                → 0%
  const percent = dailyPortionDone
    ? 100
    : (pagesRead > 0 && targetPages)
      ? getPercentage(pagesRead, targetPages)
      : 0;
  const planDoneCount = plan.filter(p => p.done).length;

  // ── Fetch on mount ────────────────────────────────────────
  useEffect(() => {
    fetchProgress();
    fetchPlan();
  }, []);

  async function fetchProgress() {
    try {
      setLoadingProgress(true);
      const res = await get('/quran/progress?date=today');
      if (res?.data) {
        setPagesRead(res.data.pagesRead ?? 0);
        setTargetPages(res.data.targetPages);
        setDailyPortionDone(res.data.dailyPortionDone ?? false);
        setDailySurah(res.data.surah || '');
        setDailyFromPage(res.data.fromPage || 0);
        setDailyToPage(res.data.toPage || 0);
      }
    } catch (err) {
      console.warn('Could not fetch quran progress:', err.message);
    } finally {
      setLoadingProgress(false);
    }
  }

  async function fetchPlan() {
    try {
      setLoadingPlan(true);
      const res = await get('/quran/plan?date=tomorrow');
      setPlan(res?.data || []);
    } catch (err) {
      console.warn('Could not fetch quran plan:', err.message);
    } finally {
      setLoadingPlan(false);
    }
  }

  // ── Toggle daily portion done ─────────────────────────────
  async function toggleDailyPortion() {
    const next = !dailyPortionDone;
    setDailyPortionDone(next);
    try {
      const res = await post('/quran/progress', { dailyPortionDone: next });
      if (res?.data) setDailyPortionDone(res.data.dailyPortionDone);
    } catch (err) {
      console.error('Toggle daily portion failed:', err.message);
      setDailyPortionDone(!next);
    }
  }

  // ── Submit "not completed" reason ─────────────────────────
  async function submitNotCompleted() {
    if (!notCompletedReason.trim()) return;
    // Save the reason as a Quran reflection note
    try {
      await post('/quran/reflection', {
        ayah: '',
        lesson: `Not completed today — ${notCompletedReason}`,
      });
      setNotCompletedReason('');
      setShowReasonInput(false);
    } catch (err) {
      console.error('Submit not completed reason failed:', err.message);
    }
  }

  // ── Plan actions ──────────────────────────────────────────
  async function addPlanItem() {
    if (!newItem.surah || !newItem.fromPage || !newItem.toPage) return;
    try {
      const res = await post('/quran/plan', {
        surah:    newItem.surah,
        fromPage: parseInt(newItem.fromPage),
        toPage:   parseInt(newItem.toPage),
        notes:    newItem.notes,
      });
      setPlan(prev => [...prev, res.data]);
      setNewItem({ surah: '', fromPage: '', toPage: '', notes: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Add quran plan item failed:', err.message);
    }
  }

  async function togglePlanItem(id) {
    const current = plan.find(p => p._id === id);
    if (!current) return;
    // Optimistic
    setPlan(prev => prev.map(p => p._id === id ? { ...p, done: !p.done } : p));
    try {
      await patch(`/quran/plan/${id}`, { done: !current.done });
    } catch (err) {
      console.error('Toggle plan item failed:', err.message);
      setPlan(prev => prev.map(p => p._id === id ? { ...p, done: current.done } : p));
    }
  }

  async function deletePlanItem(id) {
    setPlan(prev => prev.filter(p => p._id !== id)); // optimistic
    try {
      await del(`/quran/plan/${id}`);
    } catch (err) {
      console.error('Delete plan item failed:', err.message);
      fetchPlan(); // restore
    }
  }

  // ── Reflection ────────────────────────────────────────────
  async function saveReflection() {
    setSavingReflection(true);
    try {
      await post('/quran/reflection', reflection);
      setReflection({ ayah: '', lesson: '' }); // clear after save
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 3000);
    } catch (err) {
      console.error('Save reflection failed:', err.message);
    } finally {
      setSavingReflection(false);
    }
  }

  return (
    <PageLayout title="Quran" subtitle="Daily consistency with the Book of Allah">
      <div className="space-y-4">

        {/* ── Islamic banner (replaces DailyReminderCard) ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-emerald-900/30 bg-gradient-to-br from-emerald-950/30 to-slate-900 px-5 py-5 text-center"
        >
          <p
            className="font-arabic text-2xl text-emerald-200 leading-loose mb-2"
            dir="rtl"
            lang="ar"
          >
            أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
          </p>
          <p className="font-display text-slate-400 text-sm italic">
            "Verily, in the remembrance of Allah do hearts find rest."
          </p>
          <p className="text-xs text-emerald-700 mt-1">Surah Ar-Ra'd 13:28</p>
        </motion.div>

        {/* ── SECTION 1: Daily Portion ── */}
        {loadingProgress ? (
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6">
            <LoadingSpinner message="Loading today's progress..." />
          </div>
        ) : (
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
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={13} className="text-emerald-500" />
                  <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">
                    Daily Portion — Do Not Skip
                  </p>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">Today's Quran Reading</h3>

                {/* Dynamic daily plan — populated from yesterday's reading plan */}
                {dailySurah ? (
                  <p className="text-sm text-emerald-300 font-medium">
                    {dailySurah}
                    {dailyFromPage > 0 && dailyToPage > 0 && (
                      <span className="text-slate-400 font-normal"> · Page {dailyFromPage} → {dailyToPage}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    No reading planned yet — add tomorrow's plan below ↓
                  </p>
                )}
              </div>
              <ProgressRing percentage={percent} size={68} strokeWidth={6} color="#10b981" />
            </div>

            {/* Daily portion checkbox */}
            <div
              onClick={toggleDailyPortion}
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

            {/* Action buttons */}
            {!dailyPortionDone ? (
              <div className="space-y-2">
                <button
                  onClick={toggleDailyPortion}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={15} />
                  Mark as Read — Completed
                </button>

                {/* Not completed flow */}
                {!showReasonInput ? (
                  <button
                    onClick={() => setShowReasonInput(true)}
                    className="w-full py-2.5 rounded-xl border border-slate-700/50 hover:border-red-800/50 text-slate-500 hover:text-red-400 text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={14} />
                    Not Completed Today
                  </button>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <textarea
                        value={notCompletedReason}
                        onChange={e => setNotCompletedReason(e.target.value)}
                        placeholder="Why couldn't you complete it today? (e.g. was sick, had exams...)"
                        rows={2}
                        className="w-full bg-slate-800/60 border border-red-900/40 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-700/60 transition-colors resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={submitNotCompleted}
                          disabled={!notCompletedReason.trim()}
                          className="flex-1 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 text-sm font-medium transition-colors disabled:opacity-40"
                        >
                          Save Reason
                        </button>
                        <button
                          onClick={() => { setShowReasonInput(false); setNotCompletedReason(''); }}
                          className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
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
        )}

        {/* ── SECTION 2: Tomorrow's Reading Plan ── */}
        <Section
          title="Tomorrow's Reading Plan"
          subtitle="Plan what you will read tomorrow"
          icon={BookMarked}
          iconColor="text-emerald-400"
          badge={plan.length > 0 ? `${planDoneCount}/${plan.length}` : undefined}
          defaultOpen={true}
        >
          <div className="space-y-3 mt-3">
            {loadingPlan ? (
              <LoadingSpinner message="Loading plan..." />
            ) : (
              <AnimatePresence>
                {plan.map(item => (
                  <PlanItem
                    key={item._id}
                    item={item}
                    onToggle={togglePlanItem}
                    onDelete={deletePlanItem}
                  />
                ))}
              </AnimatePresence>
            )}

            {!loadingPlan && plan.length === 0 && !showForm && (
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

        {/* ── SECTION 3: Reflection ── */}
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
            <AnimatePresence>
              {reflectionSaved && <SuccessToast message="Reflection saved — Alhamdulillah!" />}
            </AnimatePresence>
            <button
              onClick={saveReflection}
              disabled={savingReflection}
              className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-400 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {savingReflection ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        </Section>

        {/* Daily Quran verse */}
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
