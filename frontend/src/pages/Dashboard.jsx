import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Moon, BookMarked, Flame, Clock, Calendar, ChevronRight } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import ProgressRing from '../components/ProgressRing';
import {
  getTodayFormatted,
  getDaysRemaining,
  getCountdownParts,
  getDailyIndex,
  getPercentage,
} from '../utils/helpers';
import {
  EXAM_DATE,
  quranVerses,
  hadiths,
  dashboardStats,
  studyStats,
  quranProgress,
  prayersData,
} from '../data/mockData';

// Countdown timer component
function CountdownTimer() {
  const [parts, setParts] = useState(getCountdownParts(EXAM_DATE));

  useEffect(() => {
    const interval = setInterval(() => {
      setParts(getCountdownParts(EXAM_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: 'Days', value: parts.days },
    { label: 'Hours', value: parts.hours },
    { label: 'Min', value: parts.minutes },
    { label: 'Sec', value: parts.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <motion.span
              key={value}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-xl font-bold text-emerald-400 tabular-nums w-10 text-center"
            >
              {String(value).padStart(2, '0')}
            </motion.span>
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-emerald-800 text-lg font-light mb-3">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Main dashboard card for Study / Quran / Salah
function MainCard({ icon: Icon, title, percentage, streak, streakLabel, actionLabel, onClick, color, delay }) {
  const colorMap = {
    emerald: {
      border: 'border-emerald-900/40',
      bg: 'from-slate-900 to-emerald-950/20',
      icon: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      btn: 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-600/30',
    },
    amber: {
      border: 'border-amber-900/30',
      bg: 'from-slate-900 to-amber-950/10',
      icon: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      btn: 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border-amber-600/30',
    },
    blue: {
      border: 'border-blue-900/30',
      bg: 'from-slate-900 to-blue-950/10',
      icon: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      btn: 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-600/30',
    },
  };
  const c = colorMap[color] || colorMap.emerald;
  const ringColor = color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : '#60a5fa';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={`rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-5 cursor-pointer card-hover`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl border ${c.icon}`}>
          <Icon size={18} />
        </div>
        <ProgressRing percentage={percentage} size={56} strokeWidth={5} color={ringColor} />
      </div>

      <h3 className="font-semibold text-slate-200 text-base mb-1">{title}</h3>

      <div className="flex items-center gap-1.5 mb-4">
        <Flame size={12} className="text-orange-400" />
        <span className="text-xs text-slate-400">
          <span className="text-orange-400 font-semibold">{streak}</span> {streakLabel}
        </span>
      </div>

      <button
        className={`w-full py-2 px-3 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${c.btn}`}
        onClick={onClick}
      >
        {actionLabel}
        <ChevronRight size={12} />
      </button>
    </motion.div>
  );
}

// ─── Swipeable Quote Card ─────────────────────────────────────
// TODO: Fetch daily Quran verse from backend — GET /api/quran/verse/daily
// TODO: Fetch daily Hadith from backend — GET /api/hadith/daily
function SwipeableQuoteCard({ verse, hadith }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const dragStartX = useRef(0);

  const slides = [
    { type: 'Quran', label: 'Quran', pillStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', content: verse },
    { type: 'Hadith', label: 'Hadith', pillStyle: 'text-amber-400 bg-amber-500/10 border-amber-500/20', content: hadith },
  ];

  function goTo(next) {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  }

  function handleDragEnd(_, info) {
    if (info.offset.x < -40 && index < slides.length - 1) goTo(index + 1);
    else if (info.offset.x > 40 && index > 0) goTo(index - 1);
  }

  const current = slides[index];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-800/40 cursor-grab active:cursor-grabbing select-none"
        style={{ minHeight: 200 }}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="p-6"
          >
            {/* Pill tag */}
            <div className="mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${current.pillStyle}`}>
                {current.label}
              </span>
            </div>

            {current.type === 'Quran' ? (
              <>
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5 pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="none">
                    <circle cx="100" cy="0" r="80" stroke="#10b981" strokeWidth="1" fill="none" />
                    <circle cx="100" cy="0" r="55" stroke="#10b981" strokeWidth="1" fill="none" />
                    <circle cx="100" cy="0" r="30" stroke="#10b981" strokeWidth="1" fill="none" />
                  </svg>
                </div>
                <p className="font-arabic text-2xl text-right text-emerald-100 leading-loose mb-4" dir="rtl" lang="ar">
                  {current.content.arabic}
                </p>
                <div className="w-10 h-px bg-emerald-800 mx-auto mb-3" />
                <p className="font-display text-slate-300 text-sm italic leading-relaxed text-center mb-2">
                  "{current.content.translation}"
                </p>
                <p className="text-xs text-emerald-600 text-center">{current.content.reference}</p>
              </>
            ) : (
              <>
                <p className="font-display text-slate-200 text-base italic leading-relaxed mb-4">
                  "{current.content.text}"
                </p>
                <p className="text-xs text-slate-500">— {current.content.source}</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Page dot indicator */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === index
                  ? 'w-4 h-1.5 bg-emerald-500'
                  : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Swipe hint */}
      <p className="text-xs text-slate-600 text-center">
        {index === 0 ? 'Swipe for Hadith →' : '← Swipe for Quran'}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const daysRemaining = getDaysRemaining(EXAM_DATE);
  const dailyVerseIndex = getDailyIndex(quranVerses);
  const dailyHadithIndex = getDailyIndex(hadiths);

  // TODO: Connect exam date from backend
  // TODO: Fetch daily Quran verse from backend — GET /api/quran/verse/daily
  // TODO: Fetch daily Hadith from backend — GET /api/hadith/daily

  const salahCompleted = prayersData.filter(p => p.completed).length;
  const studyPercent = getPercentage(studyStats.todayHours, studyStats.targetHours);
  const quranPercent = getPercentage(quranProgress.todayCompleted, quranProgress.todayTarget);
  const salahPercent = getPercentage(salahCompleted, 5);

  return (
    <PageLayout>
      <div className="space-y-6">

        {/* Greeting + Date */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-2"
        >
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-widest mb-1">
            As-salamu alaykum
          </p>
          <h2 className="font-display text-2xl font-semibold text-slate-100">
            Ansar <span className="text-emerald-400">✦</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <Calendar size={12} />
            {getTodayFormatted()}
          </p>
        </motion.div>

        {/* Exam countdown card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
                National Exam Countdown
              </p>
              <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Clock size={12} />
                <span className="text-emerald-400 font-semibold">{daysRemaining} days</span> remaining
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600">Overall Streak</p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <Flame size={14} className="text-orange-400" />
                <span className="text-lg font-bold text-orange-400">{dashboardStats.overallStreak}</span>
                <span className="text-xs text-slate-500">days</span>
              </div>
            </div>
          </div>
          <CountdownTimer />
        </motion.div>

        {/* Three main cards */}
        <div className="grid grid-cols-1 gap-4">
          <MainCard
            icon={BookOpen}
            title="Study"
            percentage={studyPercent}
            streak={dashboardStats.studyStreak}
            streakLabel="day streak"
            actionLabel="Open Study"
            onClick={() => navigate('/study')}
            color="blue"
            delay={0.15}
          />
          <MainCard
            icon={BookMarked}
            title="Quran"
            percentage={quranPercent}
            streak={dashboardStats.quranStreak}
            streakLabel="day streak"
            actionLabel="Open Quran"
            onClick={() => navigate('/quran')}
            color="emerald"
            delay={0.2}
          />
          <MainCard
            icon={Moon}
            title="Salah"
            percentage={salahPercent}
            streak={dashboardStats.salahStreak}
            streakLabel="day streak"
            actionLabel="Open Salah"
            onClick={() => navigate('/salah')}
            color="amber"
            delay={0.25}
          />
        </div>

        {/* Swipeable Quote Card — Quran verse + Hadith */}
        <SwipeableQuoteCard
          verse={quranVerses[dailyVerseIndex]}
          hadith={hadiths[dailyHadithIndex]}
        />

      </div>
    </PageLayout>
  );
}
