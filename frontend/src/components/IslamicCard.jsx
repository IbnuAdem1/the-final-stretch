import { motion } from 'framer-motion';
import { BookOpen, Star } from 'lucide-react';

// Reusable card for Quran verses and Hadith
export function QuranVerseCard({ verse, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-slate-900 to-emerald-950/30 p-6 ${className}`}
    >
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
        <svg viewBox="0 0 100 100" fill="none">
          <circle cx="100" cy="0" r="80" stroke="#10b981" strokeWidth="1" fill="none" />
          <circle cx="100" cy="0" r="60" stroke="#10b981" strokeWidth="1" fill="none" />
          <circle cx="100" cy="0" r="40" stroke="#10b981" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <BookOpen size={14} className="text-emerald-400" />
        </div>
        <span className="text-xs text-emerald-500 font-medium uppercase tracking-wider pt-1">
          Quran — {verse.theme}
        </span>
      </div>

      {/* Arabic text */}
      <p
        className="font-arabic text-right text-xl leading-loose text-emerald-100 mb-4"
        dir="rtl"
        lang="ar"
      >
        {verse.arabic}
      </p>

      {/* Divider */}
      <div className="w-12 h-px bg-emerald-800 mx-auto mb-4" />

      {/* Translation */}
      <p className="font-display text-slate-300 text-sm italic leading-relaxed text-center mb-3">
        "{verse.translation}"
      </p>

      <p className="text-xs text-emerald-600 text-center">{verse.reference}</p>
    </motion.div>
  );
}

export function HadithCard({ hadith, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 ${className}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Star size={14} className="text-amber-400" />
        </div>
        <span className="text-xs text-amber-500 font-medium uppercase tracking-wider pt-1">
          Hadith — {hadith.theme}
        </span>
      </div>

      <p className="font-display text-slate-200 text-base italic leading-relaxed mb-4">
        "{hadith.text}"
      </p>

      <p className="text-xs text-slate-500">— {hadith.source}</p>
    </motion.div>
  );
}

// Daily reminder card shown on every page
export function DailyReminderCard({ verse }) {
  // TODO: Fetch daily Islamic reminder from backend — GET /api/reminders/daily
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="rounded-xl border border-emerald-900/30 bg-emerald-950/20 px-5 py-4 flex items-center gap-4"
    >
      <div className="text-emerald-500 text-xl">✦</div>
      <div className="flex-1">
        <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-1">
          Daily Reminder
        </p>
        <p className="text-slate-300 text-sm italic font-display">
          "{verse.translation}"
        </p>
        <p className="text-xs text-slate-600 mt-1">{verse.reference}</p>
      </div>
    </motion.div>
  );
}
