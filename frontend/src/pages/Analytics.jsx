import { motion } from 'framer-motion';
import { BarChart2, BookOpen, BookMarked, Moon, TrendingUp } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import ProgressRing from '../components/ProgressRing';
import WeeklyBar from '../components/WeeklyBar';
import { DailyReminderCard } from '../components/IslamicCard';
import { getDailyIndex } from '../utils/helpers';
import { analyticsData, studyStats, quranProgress, weeklySalahStats, quranVerses } from '../data/mockData';

// Consistency card with ring
function ConsistencyCard({ icon: Icon, title, percentage, color, ringColor, weeklyData, valueKey, maxValue, unit, delay }) {
  const borderMap = {
    blue: 'border-blue-900/30',
    emerald: 'border-emerald-900/30',
    amber: 'border-amber-900/30',
  };
  const bgMap = {
    blue: 'from-slate-900 to-blue-950/10',
    emerald: 'from-slate-900 to-emerald-950/10',
    amber: 'from-slate-900 to-amber-950/10',
  };
  const iconMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-2xl border ${borderMap[color]} bg-gradient-to-br ${bgMap[color]} p-5`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${iconMap[color]}`}>
            <Icon size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-sm">{title}</h3>
            <p className="text-xs text-slate-500">Monthly consistency</p>
          </div>
        </div>
        <ProgressRing
          percentage={percentage}
          size={64}
          strokeWidth={6}
          color={ringColor}
        />
      </div>

      {/* Weekly bar */}
      <div>
        <p className="text-xs text-slate-600 mb-2">This week</p>
        <WeeklyBar
          data={weeklyData}
          valueKey={valueKey}
          maxValue={maxValue}
          color={ringColor}
          unit={unit}
        />
      </div>
    </motion.div>
  );
}

// Monthly overview bar
function MonthlyBar({ data }) {
  const max = Math.max(...data.map(d => d.hours));
  return (
    <div className="flex items-end gap-3 h-24">
      {data.map((item, i) => {
        const height = Math.max(8, (item.hours / max) * 100);
        return (
          <div key={item.week} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-slate-500">{item.hours}h</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
              className="w-full rounded-t-lg bg-blue-500/40"
              style={{ minHeight: 8 }}
            />
            <span className="text-[10px] text-slate-600">{item.week}</span>
          </div>
        );
      })}
    </div>
  );
}

// Overall score card
function OverallScore() {
  const overall = Math.round(
    (analyticsData.studyConsistency + analyticsData.quranConsistency + analyticsData.salahConsistency) / 3
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-6 text-center"
    >
      <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-3">
        Overall Consistency Score
      </p>
      <div className="flex justify-center mb-4">
        <ProgressRing
          percentage={overall}
          size={100}
          strokeWidth={8}
          color="#10b981"
        />
      </div>
      <p className="font-display text-slate-300 text-sm italic">
        {overall >= 90
          ? '"Excellent discipline. Allah rewards consistency."'
          : overall >= 75
          ? '"Good progress. Keep building the habit."'
          : '"Every step forward counts. Don\'t give up."'}
      </p>
    </motion.div>
  );
}

export default function Analytics() {
  // TODO: Fetch analytics from backend — GET /api/analytics
  const dailyVerseIndex = getDailyIndex(quranVerses);

  return (
    <PageLayout title="Analytics" subtitle="Your consistency at a glance">
      <div className="space-y-5">

        {/* Daily reminder */}
        <DailyReminderCard verse={quranVerses[(dailyVerseIndex + 3) % quranVerses.length]} />

        {/* Overall score */}
        <OverallScore />

        {/* Three consistency cards */}
        <ConsistencyCard
          icon={BookOpen}
          title="Study"
          percentage={analyticsData.studyConsistency}
          color="blue"
          ringColor="#60a5fa"
          weeklyData={studyStats.weeklyData}
          valueKey="hours"
          maxValue={8}
          unit="h"
          delay={0.1}
        />

        <ConsistencyCard
          icon={BookMarked}
          title="Quran"
          percentage={analyticsData.quranConsistency}
          color="emerald"
          ringColor="#10b981"
          weeklyData={quranProgress.weeklyData}
          valueKey="pages"
          maxValue={5}
          unit=" pages"
          delay={0.15}
        />

        <ConsistencyCard
          icon={Moon}
          title="Salah"
          percentage={analyticsData.salahConsistency}
          color="amber"
          ringColor="#f59e0b"
          weeklyData={weeklySalahStats}
          valueKey="completed"
          maxValue={5}
          unit="/5"
          delay={0.2}
        />

        {/* Monthly study hours */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-blue-400" />
            <h3 className="font-semibold text-slate-200 text-sm">Monthly Study Hours</h3>
          </div>
          <MonthlyBar data={analyticsData.monthlyStudy} />
          <p className="text-xs text-slate-600 text-center mt-3">
            Total: {analyticsData.monthlyStudy.reduce((a, d) => a + d.hours, 0)}h this month
          </p>
        </motion.div>

        {/* Summary stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Study', value: `${analyticsData.studyConsistency}%`, color: 'text-blue-400' },
            { label: 'Quran', value: `${analyticsData.quranConsistency}%`, color: 'text-emerald-400' },
            { label: 'Salah', value: `${analyticsData.salahConsistency}%`, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-3 text-center"
            >
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Motivational footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-emerald-900/20 bg-emerald-950/10 p-5 text-center"
        >
          <p className="text-emerald-700 text-lg mb-2">✦</p>
          <p className="font-display text-slate-300 text-sm italic leading-relaxed">
            "I have a plan. I am making progress. Allah is with me. I should continue."
          </p>
          <p className="text-xs text-slate-600 mt-2">— Ansar's Reminder</p>
        </motion.div>

      </div>
    </PageLayout>
  );
}
