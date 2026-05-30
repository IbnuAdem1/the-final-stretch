import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Moon, BookMarked, Flame, Clock, Calendar, ChevronRight } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { QuranVerseCard, HadithCard } from '../components/IslamicCard';
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

        {/* Daily Quran verse */}
        {/* TODO: Fetch daily Quran verse from backend */}
        <QuranVerseCard verse={quranVerses[dailyVerseIndex]} />

        {/* Daily Hadith */}
        {/* TODO: Fetch daily Hadith from backend */}
        <HadithCard hadith={hadiths[dailyHadithIndex]} />

      </div>
    </PageLayout>
  );
}
