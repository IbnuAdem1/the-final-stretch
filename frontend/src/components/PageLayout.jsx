import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Moon, BookMarked, BarChart2, ChevronLeft } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/quran', icon: BookMarked, label: 'Quran' },
  { path: '/salah', icon: Moon, label: 'Salah' },
  { path: '/analytics', icon: BarChart2, label: 'Stats' },
];

export default function PageLayout({ children, title, subtitle, showBack = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 islamic-pattern">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="flex-1">
            {title && (
              <h1 className="text-base font-semibold text-slate-100 font-display">{title}</h1>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {/* Subtle bismillah mark */}
          <span className="text-emerald-800 text-xs font-arabic">بِسْمِ اللَّهِ</span>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/60 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-2 py-2 flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
