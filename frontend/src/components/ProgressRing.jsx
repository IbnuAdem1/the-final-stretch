import { motion } from 'framer-motion';

// Animated circular progress ring
export default function ProgressRing({ percentage = 0, size = 80, strokeWidth = 6, color = '#10b981', label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg width={size} height={size} className="absolute inset-0">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(16,185,129,0.1)"
            strokeWidth={strokeWidth}
          />
        </svg>
        {/* Progress ring */}
        <svg width={size} height={size} className="absolute inset-0">
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-emerald-400">{percentage}%</span>
        </div>
      </div>
      {label && <p className="text-xs text-slate-400 text-center">{label}</p>}
      {sublabel && <p className="text-xs text-slate-500 text-center">{sublabel}</p>}
    </div>
  );
}
