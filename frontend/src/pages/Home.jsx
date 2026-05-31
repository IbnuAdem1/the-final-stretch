import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Floating geometric shapes for Islamic-inspired background
function GeometricShape({ className, delay = 0 }) {
  return (
    <motion.div
      className={`absolute opacity-10 ${className}`}
      animate={{
        rotate: [0, 360],
        scale: [1, 1.05, 1],
      }}
      transition={{
        rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
        scale: { duration: 8, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* 8-pointed star — classic Islamic geometry */}
        <polygon
          points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
          stroke="#10b981"
          strokeWidth="0.8"
          fill="none"
        />
        <circle cx="50" cy="50" r="30" stroke="#10b981" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="20" stroke="#10b981" strokeWidth="0.3" fill="none" />
      </svg>
    </motion.div>
  );
}

// Stable particle data — generated once outside the component to avoid
// re-generating on every render (fixes react-hooks/purity warning)
const PARTICLE_DATA = Array.from({ length: 30 }, (_, i) => {
  // Use a deterministic pseudo-random sequence seeded by index
  const seed = (i * 9301 + 49297) % 233280;
  const rng = seed / 233280;
  const seed2 = ((i + 1) * 9301 + 49297) % 233280;
  const rng2 = seed2 / 233280;
  const seed3 = ((i + 2) * 9301 + 49297) % 233280;
  const rng3 = seed3 / 233280;
  const seed4 = ((i + 3) * 9301 + 49297) % 233280;
  const rng4 = seed4 / 233280;
  const seed5 = ((i + 4) * 9301 + 49297) % 233280;
  const rng5 = seed5 / 233280;
  return {
    id: i,
    x: rng * 100,
    y: rng2 * 100,
    size: rng3 * 2 + 1,
    delay: rng4 * 4,
    duration: rng5 * 6 + 4,
  };
});

// Particle dots
function Particles() {
  const dots = PARTICLE_DATA;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map(dot => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-emerald-500"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
          }}
          animate={{ opacity: [0, 0.4, 0], y: [0, -20, 0] }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            delay: dot.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950" />

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Geometric shapes */}
      <GeometricShape className="w-96 h-96 top-[-80px] right-[-80px]" delay={0} />
      <GeometricShape className="w-64 h-64 bottom-[-40px] left-[-40px]" delay={2} />
      <GeometricShape className="w-32 h-32 top-1/3 left-8 opacity-5" delay={4} />

      {/* Floating particles */}
      <Particles />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full gap-8">

        {/* Top ornament */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-800" />
            <span className="text-emerald-800 text-xs">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-800" />
          </div>
        </motion.div>

        {/* Title — Bismillah in large Arabic */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <h1
            className="font-arabic text-5xl font-bold text-emerald-300 leading-loose text-center"
            dir="rtl"
            lang="ar"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h1>
          <div className="w-8 h-0.5 bg-emerald-700 rounded-full" />
        </motion.div>

        {/* Quran verse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full rounded-2xl border border-emerald-900/40 bg-emerald-950/20 backdrop-blur-sm p-6"
        >
          {/* Arabic text */}
          <p
            className="font-arabic text-2xl text-emerald-200 leading-loose mb-3 text-center font-bold"
            dir="rtl"
            lang="ar"
          >
            وَعَلَى اللَّهِ فَتَوَكَّلُوا إِن كُنتُم مُّؤْمِنِينَ
          </p>
          <p className="font-display text-slate-400 text-sm italic">
            "And upon Allah rely, if you should be believers."
          </p>
          <p className="text-xs text-emerald-700 mt-2">Surah Al-Ma'idah 5:23</p>
        </motion.div>

        {/* Motivational sentence */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-slate-400 text-sm leading-relaxed font-display italic"
        >
          Take the means. Trust Allah. Continue forward.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full"
        >
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base tracking-wide transition-colors duration-200 shadow-lg shadow-emerald-900/40 relative overflow-hidden group"
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 1.5 }}
            />
            <span className="relative z-10">Bismillah, Let's Begin</span>
          </motion.button>
        </motion.div>

        {/* Bottom ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex items-center gap-2 text-emerald-900"
        >
          <span className="text-xs">✦</span>
          <span className="text-xs">✦</span>
          <span className="text-xs">✦</span>
        </motion.div>
      </div>
    </div>
  );
}
