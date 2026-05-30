import { motion } from 'framer-motion';

// Simple weekly bar chart — no external chart library needed
export default function WeeklyBar({ data, valueKey, maxValue, color = '#10b981', unit = '' }) {
  const max = maxValue || Math.max(...data.map(d => d[valueKey]), 1);

  return (
    <div className="flex items-end gap-2 h-20">
      {data.map((item, i) => {
        const height = Math.max(4, (item[valueKey] / max) * 100);
        const isToday = i === data.length - 1;
        return (
          <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
              className="w-full rounded-t-md"
              style={{
                backgroundColor: isToday ? color : `${color}40`,
                minHeight: 4,
              }}
              title={`${item[valueKey]}${unit}`}
            />
            <span className={`text-[10px] ${isToday ? 'text-emerald-400' : 'text-slate-600'}`}>
              {item.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
