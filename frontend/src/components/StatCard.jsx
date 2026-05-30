import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sublabel, color = 'emerald', delay = 0 }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 flex flex-col gap-2"
    >
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        {sublabel && <p className="text-xs text-slate-600 mt-0.5">{sublabel}</p>}
      </div>
    </motion.div>
  );
}
