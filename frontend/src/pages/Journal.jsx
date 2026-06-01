import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ScrollText, BookOpen, BookMarked, Moon, ChevronDown, ChevronUp,
  CheckCircle2, Circle, Star, User, BarChart2, CheckCheck,
  MessageSquare, Pencil, Trash2, X, Check
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { get, post, patch, delWithBody } from '../utils/api';

// ─── Helpers ──────────────────────────────────────────────────
function getSubjectColor(subject) {
  const colors = {
    Mathematics: 'text-blue-400 bg-blue-400/10',
    Biology:     'text-emerald-400 bg-emerald-400/10',
    Physics:     'text-purple-400 bg-purple-400/10',
    Chemistry:   'text-orange-400 bg-orange-400/10',
    English:     'text-pink-400 bg-pink-400/10',
  };
  return colors[subject] || 'text-slate-400 bg-slate-400/10';
}

// ─── Summary pill row ─────────────────────────────────────────
function SummaryPills({ summary }) {
  const pills = [
    {
      show: summary.tasksTotal > 0,
      icon: BookOpen,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      label: `${summary.tasksCompleted}/${summary.tasksTotal} tasks`,
    },
    {
      show: summary.quranPages > 0 || summary.quranDone,
      icon: BookMarked,
      color: summary.quranDone
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        : 'text-slate-400 bg-slate-500/10 border-slate-500/20',
      label: summary.quranDone && summary.quranPages === 0
        ? 'Quran ✓'
        : `${summary.quranPages}/${summary.quranTarget} pages`,
    },
    {
      show: summary.salahCompleted > 0,
      icon: Moon,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      label: `${summary.salahCompleted}/5 prayers`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {pills.filter(p => p.show).map(({ icon: Icon, color, label }, i) => (
        <span key={i} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${color}`}>
          <Icon size={11} />
          {label}
        </span>
      ))}
    </div>
  );
}

// ─── Study section inside a day ───────────────────────────────
function StudySection({ study }) {
  const { tasks, reflection } = study;
  if (!tasks?.length && !reflection) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen size={13} className="text-blue-400" />
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Study</p>
      </div>

      {/* Tasks */}
      {tasks?.length > 0 && (
        <div className="space-y-1.5">
          {tasks.map(task => (
            <div key={task._id} className="flex items-start gap-2.5">
              {task.completed
                ? <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                : <Circle size={14} className="text-slate-600 mt-0.5 flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                  {task.task}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getSubjectColor(task.subject)}`}>
                    {task.subject}
                  </span>
                  {task.estimatedHours > 0 && (
                    <span className="text-xs text-slate-600">{task.estimatedHours}h</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reflection */}
      {reflection && (reflection.wentWell || reflection.distracted || reflection.improve) && (
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3 space-y-2">
          <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Star size={11} className="text-amber-400" />
            End of Day Reflection
          </p>
          {reflection.wentWell && (
            <div>
              <p className="text-xs text-slate-600 mb-0.5">What went well</p>
              <p className="text-sm text-slate-300 italic">"{reflection.wentWell}"</p>
            </div>
          )}
          {reflection.distracted && (
            <div>
              <p className="text-xs text-slate-600 mb-0.5">What distracted me</p>
              <p className="text-sm text-slate-300 italic">"{reflection.distracted}"</p>
            </div>
          )}
          {reflection.improve && (
            <div>
              <p className="text-xs text-slate-600 mb-0.5">What to improve</p>
              <p className="text-sm text-slate-300 italic">"{reflection.improve}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quran section inside a day ───────────────────────────────
function QuranSection({ quran }) {
  const { progress, plan, reflection } = quran;
  if (!progress && !plan?.length && !reflection) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookMarked size={13} className="text-emerald-400" />
        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Quran</p>
      </div>

      {/* Progress */}
      {progress && (
        <div className="flex items-center gap-3">
          {progress.dailyPortionDone ? (
            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
              <CheckCircle2 size={15} className="text-emerald-500" />
              Alhamdulillah ✓
            </div>
          ) : progress.pagesRead > 0 ? (
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
              <Circle size={15} className="text-slate-600" />
              {progress.pagesRead}/{progress.targetPages} pages read
            </div>
          ) : null}
        </div>
      )}

      {/* Plan items */}
      {plan?.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-600">Reading plan</p>
          {plan.map(item => (
            <div key={item._id}>
              <p className="text-sm text-slate-300">{item.surah}</p>
              <p className="text-xs text-slate-600">
                Page {item.fromPage} → {item.toPage}
                {item.notes && <span className="ml-2 italic text-slate-500">"{item.notes}"</span>}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reflection */}
      {reflection && (reflection.ayah || reflection.lesson) && (
        <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/30 p-3 space-y-2">
          <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
            <Star size={11} />
            Quran Reflection
          </p>
          {reflection.ayah && (
            <div>
              <p className="text-xs text-slate-600 mb-0.5">Ayah that impacted me</p>
              <p className="text-sm text-slate-300 italic">"{reflection.ayah}"</p>
            </div>
          )}
          {reflection.lesson && (
            <div>
              <p className="text-xs text-slate-600 mb-0.5">Lesson taken</p>
              <p className="text-sm text-slate-300 italic">"{reflection.lesson}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Salah section inside a day ───────────────────────────────
function SalahSection({ salah }) {
  const { record } = salah;
  if (!record) return null;

  const completed = record.prayers.filter(p => p.completed);
  if (completed.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Moon size={13} className="text-amber-400" />
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Salah</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {record.prayers.map(prayer => (
          <div
            key={prayer.name}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border ${
              prayer.completed
                ? prayer.jamaah
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-slate-600 bg-slate-800/40 border-slate-700/30'
            }`}
          >
            {prayer.completed
              ? <CheckCircle2 size={11} />
              : <Circle size={11} />
            }
            <span className="font-medium">{prayer.name}</span>
            {prayer.jamaah && <span className="text-[9px] opacity-70">Jama'ah</span>}
          </div>
        ))}
      </div>
      {record.prayers.some(p => p.notes) && (
        <div className="space-y-1">
          {record.prayers.filter(p => p.notes).map(p => (
            <p key={p.name} className="text-xs text-slate-500 italic">
              {p.name}: "{p.notes}"
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mentor section inside a day ─────────────────────────────
// mentorCode is passed down from the parent when mentor is unlocked
function MentorSection({ mentor, mentorCode, onFeedbackUpdated }) {
  const { feedbacks } = mentor;
  if (!feedbacks?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User size={13} className="text-purple-400" />
        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Mentor Feedback</p>
      </div>
      {feedbacks.map((fb) => (
        <FeedbackItem
          key={fb._id || fb.createdAt}
          fb={fb}
          mentorCode={mentorCode}
          onUpdated={onFeedbackUpdated}
        />
      ))}
    </div>
  );
}

// Single feedback item with inline edit/delete
function FeedbackItem({ fb, mentorCode, onUpdated }) {
  const [editing, setEditing]   = useState(false);
  const [editText, setEditText] = useState(fb.message);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isMentor = !!mentorCode;

  async function saveEdit() {
    if (!editText.trim() || !fb._id) return;
    setSaving(true);
    try {
      await patch(`/mentor/feedback/${fb._id}`, { message: editText, mentorCode });
      setEditing(false);
      onUpdated?.();
    } catch (err) {
      console.error('Edit feedback failed:', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteFeedback() {
    if (!fb._id) return;
    setDeleting(true);
    try {
      await delWithBody(`/mentor/feedback/${fb._id}`, { mentorCode });
      onUpdated?.();
    } catch (err) {
      console.error('Delete feedback failed:', err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center">
            <User size={10} className="text-purple-400" />
          </div>
          <p className="text-xs font-medium text-slate-300">{fb.mentorName || 'Ahmed'}</p>
          {fb.createdAt && (
            <p className="text-xs text-slate-600">
              {new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>
        {/* Edit/Delete buttons — only visible when mentor is unlocked */}
        {isMentor && fb._id && (
          <div className="flex items-center gap-1">
            {!editing ? (
              <>
                <button
                  onClick={() => { setEditing(true); setEditText(fb.message); }}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                  title="Edit"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={deleteFeedback}
                  disabled={deleting}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors disabled:opacity-40"
                  title="Save"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-700/40 transition-colors"
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          value={editText}
          onChange={e => setEditText(e.target.value)}
          rows={3}
          className="w-full bg-slate-700/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-700/60 transition-colors resize-none"
          autoFocus
        />
      ) : (
        <p className="text-sm text-slate-300 italic font-display">"{fb.message}"</p>
      )}
    </div>
  );
}

// ─── Single day card ──────────────────────────────────────────
function DayCard({ entry, defaultOpen = false, mentorCode, onFeedbackUpdated }) {
  const [open, setOpen] = useState(defaultOpen);

  const isToday = entry.dateKey === (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden ${
        isToday
          ? 'border-emerald-800/50 bg-gradient-to-br from-emerald-950/20 to-slate-900'
          : 'border-slate-800/60 bg-slate-900/50'
      }`}
    >
      {/* Day header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 text-left"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isToday && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Today
                </span>
              )}
              <p className="text-sm font-semibold text-slate-200">{entry.dateLabel}</p>
            </div>
            <SummaryPills summary={entry.summary} />
          </div>
          <div className="flex-shrink-0 ml-3 mt-1">
            {open
              ? <ChevronUp size={15} className="text-slate-500" />
              : <ChevronDown size={15} className="text-slate-500" />
            }
          </div>
        </div>
      </button>

      {/* Day detail — expandable */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-800/40 space-y-5 pt-4">
              <StudySection  study={entry.study} />
              <QuranSection  quran={entry.quran} />
              <SalahSection  salah={entry.salah} />
              <MentorSection
                mentor={entry.mentor}
                mentorCode={mentorCode}
                onFeedbackUpdated={onFeedbackUpdated}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Mentor feedback form (mentor mode) ──────────────────────
function MentorFeedbackForm({ onUnlocked, onSubmitted }) {
  const [code, setCode]         = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage]   = useState('');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  async function unlock() {
    setError('');
    try {
      await post('/mentor/verify', { mentorCode: code });
      setUnlocked(true);
      onUnlocked?.(code);
    } catch (err) {
      if (err.message.includes('403') || err.message.toLowerCase().includes('incorrect')) {
        setError('Incorrect code.');
      } else {
        setError('Could not verify. Check connection.');
      }
    }
  }

  async function submit() {
    if (!message.trim()) return;
    setSaving(true);
    try {
      await post('/mentor/feedback', { message, mentorName: 'Ahmed', mentorCode: code });
      setMessage('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSubmitted?.(); // refresh journal
    } catch {
      setError('Failed to submit. Check your code.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-purple-900/30 bg-slate-900/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <User size={15} className="text-purple-400" />
        <h3 className="font-semibold text-slate-200 text-sm">Leave Mentor Feedback</h3>
      </div>

      {!unlocked ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Enter mentor code to leave feedback for Ansar</p>
          <div className="flex gap-2">
            <input
              type="password"
              value={code}
              onChange={e => { setCode(e.target.value); setError(''); }}
              placeholder="Mentor code"
              onKeyDown={e => e.key === 'Enter' && unlock()}
              className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-700/60 transition-colors"
            />
            <button
              onClick={unlock}
              className="px-4 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 text-purple-400 text-sm font-medium transition-colors"
            >
              Unlock
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-xs text-purple-400 font-medium">Mentor mode active</p>
          </div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Leave feedback for Ansar based on his journal..."
            rows={3}
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-700/60 transition-colors resize-none"
          />
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-emerald-400 px-3 py-2 rounded-xl bg-emerald-600/10 border border-emerald-600/20"
              >
                <CheckCheck size={14} />
                Feedback submitted!
              </motion.div>
            )}
          </AnimatePresence>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={submit}
            disabled={saving || !message.trim()}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <MessageSquare size={14} />
            {saving ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Journal page ────────────────────────────────────────
export default function Journal() {
  const navigate  = useNavigate();
  const [journal,     setJournal]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [days,        setDays]        = useState(30);
  const [mentorCode,  setMentorCode]  = useState(''); // set when mentor unlocks

  const fetchJournal = useCallback(async () => {
    try {
      setLoading(true);
      const res = await get(`/journal?days=${days}`);
      setJournal(res?.data || []);
    } catch (err) {
      console.warn('Could not fetch journal:', err.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchJournal(); }, [fetchJournal]);

  return (
    <PageLayout title="Journal" subtitle="Your complete record — every day, every effort">
      <div className="space-y-4">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText size={16} className="text-emerald-400" />
            <p className="text-sm font-medium text-slate-300">
              {loading ? '...' : `${journal.length} days recorded`}
            </p>
          </div>

          {/* Range selector */}
          <div className="flex gap-1.5">
            {[7, 30, 60].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  days === d
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                    : 'text-slate-500 hover:text-slate-300 border border-slate-700/50'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Analytics shortcut */}
        <button
          onClick={() => navigate('/analytics')}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-800/60 bg-slate-900/40 hover:border-emerald-800/40 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <BarChart2 size={15} className="text-blue-400" />
            <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
              View Analytics & Consistency Stats
            </span>
          </div>
          <ChevronDown size={14} className="text-slate-600 -rotate-90" />
        </button>

        {/* Mentor feedback form */}
        <MentorFeedbackForm
          onUnlocked={(code) => setMentorCode(code)}
          onSubmitted={fetchJournal}
        />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800/60" />
          <p className="text-xs text-slate-600 uppercase tracking-wider">Past Entries</p>
          <div className="flex-1 h-px bg-slate-800/60" />
        </div>

        {/* Journal entries */}
        {loading ? (
          <LoadingSpinner message="Loading your journal..." />
        ) : journal.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <ScrollText size={32} className="text-slate-700 mx-auto" />
            <p className="text-sm text-slate-500">No entries yet for this period.</p>
            <p className="text-xs text-slate-600">
              Start tracking your Study, Quran, and Salah — your journal will fill up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {journal.map((entry, i) => (
              <DayCard
                key={entry.dateKey}
                entry={entry}
                defaultOpen={i === 0}
                mentorCode={mentorCode}
                onFeedbackUpdated={fetchJournal}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && journal.length > 0 && days < 90 && (
          <button
            onClick={() => setDays(d => Math.min(d + 30, 90))}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-emerald-700/50 text-slate-500 hover:text-emerald-400 text-sm transition-colors"
          >
            Load more entries
          </button>
        )}

      </div>
    </PageLayout>
  );
}
