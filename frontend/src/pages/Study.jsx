import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, Plus, Trash2, Pencil, X, Check,
  MessageSquare, ChevronDown, ChevronUp, User, Lock, CheckCheck, Clock
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { DailyReminderCard } from '../components/IslamicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSubjectColor, getPriorityColor, getDailyIndex } from '../utils/helpers';
import { get, post, patch, del } from '../utils/api';
import { quranVerses } from '../data/mockData';

// ─── Helper: format "HH:MM" → "h:MM AM/PM" ───────────────────
function formatTime(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ─── Section wrapper ──────────────────────────────────────────
function Section({ title, subtitle, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h3 className="font-semibold text-slate-200 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {open
          ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" />
          : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />
        }
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
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

// ─── Task item ────────────────────────────────────────────────
function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      className={`flex items-start gap-3 py-3 border-b border-slate-800/40 last:border-0 ${task.completed ? 'opacity-60' : ''}`}
    >
      <button onClick={() => onToggle(task._id)} className="mt-0.5 flex-shrink-0">
        {task.completed
          ? <CheckCircle2 size={18} className="text-emerald-500" />
          : <Circle size={18} className="text-slate-600 hover:text-emerald-500 transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {task.task}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSubjectColor(task.subject)}`}>
            {task.subject}
          </span>
          {task.estimatedHours > 0 && (
            <span className="text-xs text-slate-600">{task.estimatedHours}h</span>
          )}
          {task.studyTime && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={10} />
              {formatTime(task.studyTime)}
            </span>
          )}
          {task.place && (
            <span className="text-xs text-slate-600">📍 {task.place}</span>
          )}
        </div>
      </div>
      {/* Edit / Delete */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {confirmDelete ? (
          <>
            <button
              onClick={() => onDelete(task._id)}
              className="p-1.5 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors text-xs font-medium px-2"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Tomorrow plan card ───────────────────────────────────────
function PlanCard({ item, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSubjectColor(item.subject)}`}>
            {item.subject}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPriorityColor(item.priority)}`}>
            {item.priority}
          </span>
        </div>
        <p className="text-sm text-slate-200">{item.task}</p>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <span className="text-xs text-slate-500">{item.estimatedHours}h estimated</span>
          {item.studyTime && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={10} />
              {formatTime(item.studyTime)}
            </span>
          )}
          {item.place && (
            <span className="text-xs text-slate-600">📍 {item.place}</span>
          )}
        </div>
      </div>
      {/* Edit / Delete */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {confirmDelete ? (
          <>
            <button
              onClick={() => onDelete(item._id)}
              className="rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors text-xs font-medium px-2 py-1"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function Study() {
  // ── State ─────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [plan, setPlan] = useState([]);
  const [reflection, setReflection] = useState({ wentWell: '', distracted: '', improve: '' });
  const [mentorMsg, setMentorMsg] = useState({ message: '', mentorName: '', timestamp: '' });
  const [mentorInput, setMentorInput] = useState('');
  const [mentorCode, setMentorCode] = useState('');
  const [mentorUnlocked, setMentorUnlocked] = useState(false);

  // Loading states
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingMentor, setLoadingMentor] = useState(true);

  // Action states
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  const dailyVerseIndex = getDailyIndex(quranVerses);
  const completedCount = tasks.filter(t => t.completed).length;

  // ── Fetch on mount ────────────────────────────────────────
  useEffect(() => {
    fetchTasks();
    fetchPlan();
    fetchMentorFeedback();
    fetchReflection();
  }, []);

  async function fetchTasks() {
    try {
      setLoadingTasks(true);
      const res = await get('/tasks?date=today');
      setTasks(res.data || []);
    } catch (err) {
      console.warn('Could not fetch tasks:', err.message);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }

  async function fetchPlan() {
    try {
      setLoadingPlan(true);
      const res = await get('/tasks?date=tomorrow');
      setPlan(res.data || []);
    } catch (err) {
      console.warn('Could not fetch plan:', err.message);
      setPlan([]);
    } finally {
      setLoadingPlan(false);
    }
  }

  async function fetchMentorFeedback() {
    try {
      setLoadingMentor(true);
      const res = await get('/mentor/feedback');
      setMentorMsg(res.data || {});
    } catch (err) {
      console.warn('Could not fetch mentor feedback:', err.message);
    } finally {
      setLoadingMentor(false);
    }
  }

  async function fetchReflection() {
    try {
      const res = await get('/reflections?date=today');
      if (res.data) {
        setReflection({
          wentWell: res.data.wentWell || '',
          distracted: res.data.distracted || '',
          improve: res.data.improve || '',
        });
      }
    } catch (err) {
      console.warn('Could not fetch reflection:', err.message);
    }
  }

  // ── Task actions ──────────────────────────────────────────
  async function toggleTask(id) {
    const current = tasks.find(t => t._id === id);
    if (!current) return;
    setTasks(prev => prev.map(t => t._id === id ? { ...t, completed: !t.completed } : t));
    try {
      await patch(`/tasks/${id}`, { completed: !current.completed });
    } catch (err) {
      console.error('Toggle task failed:', err.message);
      setTasks(prev => prev.map(t => t._id === id ? { ...t, completed: current.completed } : t));
    }
  }

  async function deleteTask(id) {
    setTasks(prev => prev.filter(t => t._id !== id));
    try {
      await del(`/tasks/${id}`);
    } catch (err) {
      console.error('Delete task failed:', err.message);
      fetchTasks();
    }
  }

  // ── Edit state (shared for both today's tasks and tomorrow's plan) ──
  const EMPTY_FORM = { subject: '', task: '', estimatedHours: '', priority: 'medium', place: '', studyTime: '' };
  const [newTask,    setNewTask]    = useState(EMPTY_FORM);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null); // null = add mode, id = edit mode
  const [editTarget, setEditTarget] = useState(null); // 'today' | 'tomorrow'

  function openEditTask(task, target) {
    setEditingId(task._id);
    setEditTarget(target);
    setNewTask({
      subject:        task.subject        || '',
      task:           task.task           || '',
      estimatedHours: task.estimatedHours || '',
      priority:       task.priority       || 'medium',
      place:          task.place          || '',
      studyTime:      task.studyTime      || '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setEditTarget(null);
    setNewTask(EMPTY_FORM);
  }

  // ── Plan actions ──────────────────────────────────────────
  async function addPlanItem() {
    if (!newTask.subject || !newTask.task) return;
    try {
      const res = await post('/tasks', {
        subject:        newTask.subject,
        task:           newTask.task,
        estimatedHours: parseFloat(newTask.estimatedHours) || 1,
        priority:       newTask.priority,
        place:          newTask.place,
        studyTime:      newTask.studyTime,
        isForTomorrow:  true,
      });
      setPlan(prev => [...prev, res.data]);
      closeForm();
    } catch (err) {
      console.error('Add plan item failed:', err.message);
    }
  }

  async function saveEdit() {
    if (!newTask.subject || !newTask.task || !editingId) return;
    const updates = {
      subject:        newTask.subject,
      task:           newTask.task,
      estimatedHours: parseFloat(newTask.estimatedHours) || 1,
      priority:       newTask.priority,
      place:          newTask.place,
      studyTime:      newTask.studyTime,
    };
    try {
      const res = await patch(`/tasks/${editingId}`, updates);
      if (editTarget === 'today') {
        setTasks(prev => prev.map(t => t._id === editingId ? res.data : t));
      } else {
        setPlan(prev => prev.map(p => p._id === editingId ? res.data : p));
      }
      closeForm();
    } catch (err) {
      console.error('Edit task failed:', err.message);
    }
  }

  async function deletePlanItem(id) {
    setPlan(prev => prev.filter(p => p._id !== id));
    try {
      await del(`/tasks/${id}`);
    } catch (err) {
      console.error('Delete plan item failed:', err.message);
      fetchPlan();
    }
  }

  // ── Reflection ────────────────────────────────────────────
  async function saveReflection() {
    setSavingReflection(true);
    try {
      await post('/reflections', reflection);
      // Keep the fields populated — the user's text is their saved reflection
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 3000);
    } catch (err) {
      console.error('Save reflection failed:', err.message);
    } finally {
      setSavingReflection(false);
    }
  }

  // ── Mentor mode ───────────────────────────────────────────
  async function unlockMentor() {
    setUnlockError('');
    try {
      await post('/mentor/verify', { mentorCode });
      setMentorUnlocked(true);
    } catch (err) {
      if (err.message.includes('403') || err.message.toLowerCase().includes('incorrect')) {
        setUnlockError('Incorrect code. Please try again.');
      } else {
        setUnlockError('Could not verify. Check your connection.');
      }
    }
  }

  async function submitMentorFeedback() {
    if (!mentorInput.trim()) return;
    setSubmittingFeedback(true);
    try {
      const res = await post('/mentor/feedback', {
        message: mentorInput,
        mentorName: 'Ahmed',
        mentorCode,
      });
      setMentorMsg(res.data);
      setMentorInput('');
      setFeedbackSaved(true);
      setTimeout(() => setFeedbackSaved(false), 3000);
    } catch (err) {
      if (err.message.includes('403') || err.message.toLowerCase().includes('incorrect')) {
        setUnlockError('Incorrect mentor code.');
        setMentorUnlocked(false);
      } else {
        console.error('Submit feedback failed:', err.message);
      }
    } finally {
      setSubmittingFeedback(false);
    }
  }

  return (
    <PageLayout title="Study" subtitle={`${completedCount}/${tasks.length} tasks done today`}>
      <div className="space-y-4">

        {/* Daily reminder */}
        <DailyReminderCard verse={quranVerses[dailyVerseIndex]} />

        {/* ── SECTION 1: Today's Tasks ── */}
        <Section
          title="Today's Tasks"
          subtitle={loadingTasks ? 'Loading...' : `${completedCount} of ${tasks.length} completed`}
        >
          <div className="mt-3">
            {loadingTasks ? (
              <LoadingSpinner message="Loading tasks..." />
            ) : tasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500">No tasks for today yet.</p>
                <p className="text-xs text-slate-600 mt-1">Add tasks from tomorrow's plan or ask your mentor.</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggle={toggleTask}
                  onEdit={(t) => openEditTask(t, 'today')}
                  onDelete={deleteTask}
                />
              ))
            )}
          </div>

          {/* Progress bar */}
          {!loadingTasks && tasks.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Progress</span>
                <span>{Math.round((completedCount / tasks.length) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </Section>

        {/* ── SECTION 2: End of Day Reflection ── */}
        <Section title="End of Day Reflection" subtitle="Take a moment to reflect">
          <div className="space-y-4 mt-3">
            {[
              { key: 'wentWell', label: 'What went well today?', placeholder: 'Alhamdulillah, I completed...' },
              { key: 'distracted', label: 'What distracted me today?', placeholder: 'I got distracted by...' },
              { key: 'improve', label: 'What should I improve tomorrow?', placeholder: 'Tomorrow I will...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">{label}</label>
                <textarea
                  value={reflection[key]}
                  onChange={e => setReflection(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 focus:ring-1 focus:ring-emerald-700/30 transition-colors resize-none"
                />
              </div>
            ))}

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

        {/* ── SECTION 3: Tomorrow's Plan ── */}
        <Section title="Tomorrow's Plan" subtitle="Plan your next day with intention">
          <div className="space-y-3 mt-3">
            {loadingPlan ? (
              <LoadingSpinner message="Loading plan..." />
            ) : (
              <AnimatePresence>
                {plan.map(item => (
                  <PlanCard
                    key={item._id}
                    item={item}
                    onEdit={(t) => openEditTask(t, 'tomorrow')}
                    onDelete={deletePlanItem}
                  />
                ))}
              </AnimatePresence>
            )}

            {/* Add / Edit task form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 space-y-3 overflow-hidden"
                >
                  <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                    {editingId ? 'Edit Task' : 'Add Task for Tomorrow'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Subject</label>
                      <input
                        value={newTask.subject}
                        onChange={e => setNewTask(p => ({ ...p, subject: e.target.value }))}
                        placeholder="e.g. Biology"
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Est. Hours</label>
                      <input
                        type="number"
                        value={newTask.estimatedHours}
                        onChange={e => setNewTask(p => ({ ...p, estimatedHours: e.target.value }))}
                        placeholder="e.g. 2"
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Task</label>
                    <input
                      value={newTask.task}
                      onChange={e => setNewTask(p => ({ ...p, task: e.target.value }))}
                      placeholder="Describe the task..."
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-700/60 transition-colors"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Study Time</label>
                      <input
                        type="time"
                        value={newTask.studyTime}
                        onChange={e => setNewTask(p => ({ ...p, studyTime: e.target.value }))}
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-700/60 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Study Location</label>
                    <input
                      value={newTask.place}
                      onChange={e => setNewTask(p => ({ ...p, place: e.target.value }))}
                      placeholder="e.g. Library, Home, Masjid..."
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editingId ? saveEdit : addPlanItem}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      {editingId ? <><Check size={13} /> Save Changes</> : 'Add Task'}
                    </button>
                    <button
                      onClick={closeForm}
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
                onClick={() => { setEditingId(null); setNewTask(EMPTY_FORM); setShowForm(true); }}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-emerald-700/50 text-slate-500 hover:text-emerald-400 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Add Task for Tomorrow
              </button>
            )}
          </div>
        </Section>

        {/* ── SECTION 4: Mentor Feedback ── */}
        <Section title="Mentor Feedback" subtitle="Guidance from your mentor">
          <div className="mt-3 space-y-4">

            {/* Latest mentor message */}
            {loadingMentor ? (
              <LoadingSpinner message="Loading feedback..." />
            ) : mentorMsg && mentorMsg.message ? (
              <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
                    <User size={12} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">
                      {mentorMsg.mentorName || 'Ahmed'}
                    </p>
                    {mentorMsg.createdAt && (
                      <p className="text-xs text-slate-600">
                        {new Date(mentorMsg.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic font-display">
                  "{mentorMsg.message}"
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-800/20 border border-slate-700/20 p-4 text-center">
                <p className="text-sm text-slate-500">No feedback yet.</p>
                <p className="text-xs text-slate-600 mt-1">Unlock mentor mode below to leave feedback.</p>
              </div>
            )}

            {/* Mentor mode unlock */}
            {!mentorUnlocked ? (
              <div className="rounded-xl border border-slate-700/30 bg-slate-800/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-slate-500" />
                  <p className="text-xs text-slate-500">Mentor mode — enter code to leave feedback</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={mentorCode}
                    onChange={e => { setMentorCode(e.target.value); setUnlockError(''); }}
                    placeholder="Enter mentor code"
                    className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors"
                    onKeyDown={e => e.key === 'Enter' && unlockMentor()}
                  />
                  <button
                    onClick={unlockMentor}
                    className="px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-400 text-sm font-medium transition-colors"
                  >
                    Unlock
                  </button>
                </div>
                {unlockError && (
                  <p className="text-xs text-red-400 mt-2">{unlockError}</p>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-emerald-500 font-medium">Mentor mode active</p>
                </div>
                <textarea
                  value={mentorInput}
                  onChange={e => setMentorInput(e.target.value)}
                  placeholder="Leave feedback for Ansar..."
                  rows={3}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700/60 transition-colors resize-none"
                />

                <AnimatePresence>
                  {feedbackSaved && <SuccessToast message="Feedback submitted successfully!" />}
                </AnimatePresence>

                <button
                  onClick={submitMentorFeedback}
                  disabled={submittingFeedback || !mentorInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <MessageSquare size={14} />
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </motion.div>
            )}
          </div>
        </Section>

      </div>
    </PageLayout>
  );
}
