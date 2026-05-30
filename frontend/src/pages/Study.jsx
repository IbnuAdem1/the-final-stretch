import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, Plus, Trash2, BookOpen,
  MessageSquare, ChevronDown, ChevronUp, User, Lock
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { DailyReminderCard } from '../components/IslamicCard';
import { getSubjectColor, getPriorityColor, getDailyIndex } from '../utils/helpers';
import { todaysTasks, tomorrowPlan, mentorFeedback, quranVerses } from '../data/mockData';

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
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
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

// ─── Task item ────────────────────────────────────────────────
function TaskItem({ task, onToggle }) {
  return (
    <motion.div
      layout
      className={`flex items-start gap-3 py-3 border-b border-slate-800/40 last:border-0 ${task.completed ? 'opacity-60' : ''}`}
    >
      <button onClick={() => onToggle(task.id)} className="mt-0.5 flex-shrink-0">
        {task.completed
          ? <CheckCircle2 size={18} className="text-emerald-500" />
          : <Circle size={18} className="text-slate-600 hover:text-emerald-500 transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {task.task}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSubjectColor(task.subject)}`}>
            {task.subject}
          </span>
          <span className="text-xs text-slate-600">{task.duration}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tomorrow plan card ───────────────────────────────────────
function PlanCard({ item, onDelete }) {
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
        <p className="text-xs text-slate-500 mt-1">{item.estimatedHours}h estimated</p>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

export default function Study() {
  // TODO: GET today's tasks from backend — GET /api/tasks?date=today
  const [tasks, setTasks] = useState(todaysTasks);

  // TODO: GET tomorrow's plan from backend — GET /api/tasks?date=tomorrow
  const [plan, setPlan] = useState(tomorrowPlan);

  // Reflection state
  const [reflection, setReflection] = useState({ wentWell: '', distracted: '', improve: '' });

  // Tomorrow form state
  const [newTask, setNewTask] = useState({ subject: '', task: '', estimatedHours: '', priority: 'medium' });
  const [showForm, setShowForm] = useState(false);

  // Mentor mode
  const [mentorMode, setMentorMode] = useState(false);
  const [mentorInput, setMentorInput] = useState('');
  const [mentorCode, setMentorCode] = useState('');
  const [mentorUnlocked, setMentorUnlocked] = useState(false);

  const MENTOR_CODE = '786'; // Simple frontend-only gate — TODO: Replace with real auth

  const completedCount = tasks.filter(t => t.completed).length;
  const dailyVerseIndex = getDailyIndex(quranVerses);

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function addPlanItem() {
    if (!newTask.subject || !newTask.task) return;
    // TODO: Create task — POST /api/tasks
    const item = { ...newTask, id: Date.now(), estimatedHours: parseFloat(newTask.estimatedHours) || 1 };
    setPlan(prev => [...prev, item]);
    setNewTask({ subject: '', task: '', estimatedHours: '', priority: 'medium' });
    setShowForm(false);
  }

  function deletePlanItem(id) {
    // TODO: Delete task — DELETE /api/tasks/:id
    setPlan(prev => prev.filter(p => p.id !== id));
  }

  function saveReflection() {
    // TODO: Save reflection — POST /api/reflections
    alert('Reflection saved (mock). TODO: Connect to backend.');
  }

  function submitMentorFeedback() {
    // TODO: Submit mentor feedback — POST /api/mentor/feedback
    alert('Mentor feedback submitted (mock). TODO: Connect to backend.');
    setMentorInput('');
  }

  function unlockMentor() {
    if (mentorCode === MENTOR_CODE) {
      setMentorUnlocked(true);
      setMentorMode(true);
    } else {
      alert('Incorrect code.');
    }
  }

  return (
    <PageLayout title="Study" subtitle={`${completedCount}/${tasks.length} tasks done today`}>
      <div className="space-y-4">

        {/* Daily reminder */}
        <DailyReminderCard verse={quranVerses[dailyVerseIndex]} />

        {/* ── SECTION 1: Today's Tasks ── */}
        {/* TODO: GET today's tasks from backend */}
        <Section title="Today's Tasks" subtitle={`${completedCount} of ${tasks.length} completed`}>
          <div className="mt-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No tasks for today.</p>
            ) : (
              tasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} />
              ))
            )}
          </div>
          {/* Progress bar */}
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
        </Section>

        {/* ── SECTION 2: End of Day Reflection ── */}
        {/* TODO: Save reflection — POST /api/reflections */}
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
            <button
              onClick={saveReflection}
              className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-400 text-sm font-medium transition-colors"
            >
              Save Reflection
            </button>
          </div>
        </Section>

        {/* ── SECTION 3: Tomorrow's Plan ── */}
        {/* TODO: Create task — POST /api/tasks */}
        {/* TODO: Update task — PUT /api/tasks/:id */}
        {/* TODO: Delete task — DELETE /api/tasks/:id */}
        <Section title="Tomorrow's Plan" subtitle="Plan your next day with intention">
          <div className="space-y-3 mt-3">
            <AnimatePresence>
              {plan.map(item => (
                <PlanCard key={item.id} item={item} onDelete={deletePlanItem} />
              ))}
            </AnimatePresence>

            {/* Add task form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 space-y-3"
                >
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
                  <div className="flex gap-2">
                    <button
                      onClick={addPlanItem}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
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
                Add Task for Tomorrow
              </button>
            )}
          </div>
        </Section>

        {/* ── SECTION 4: Mentor Feedback ── */}
        {/* TODO: Fetch mentor feedback — GET /api/mentor/feedback */}
        {/* TODO: Submit mentor feedback — POST /api/mentor/feedback */}
        {/* TODO: Authentication — POST /api/auth/login */}
        {/* TODO: Role management — GET /api/auth/me */}
        <Section title="Mentor Feedback" subtitle="Guidance from your mentor">
          <div className="mt-3 space-y-4">
            {/* Mentor message */}
            <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
                  <User size={12} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300">{mentorFeedback.mentorName}</p>
                  <p className="text-xs text-slate-600">{mentorFeedback.timestamp}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic font-display">
                "{mentorFeedback.message}"
              </p>
            </div>

            {/* Mentor mode toggle */}
            {!mentorUnlocked ? (
              <div className="rounded-xl border border-slate-700/30 bg-slate-800/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-slate-500" />
                  <p className="text-xs text-slate-500">Mentor mode — enter code to unlock</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={mentorCode}
                    onChange={e => setMentorCode(e.target.value)}
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
                <button
                  onClick={submitMentorFeedback}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={14} />
                  Submit Feedback
                </button>
              </motion.div>
            )}
          </div>
        </Section>

      </div>
    </PageLayout>
  );
}
