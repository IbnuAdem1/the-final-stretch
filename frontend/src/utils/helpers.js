// ─── Date & Time Utilities ────────────────────────────────────

export function getTodayFormatted() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDaysRemaining(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getCountdownParts(targetDate) {
  const now = new Date();
  const diff = Math.max(0, targetDate - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export function getDailyIndex(array) {
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return dayOfYear % array.length;
}

export function getPercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function getPriorityColor(priority) {
  switch (priority) {
    case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
}

export function getSubjectColor(subject) {
  const colors = {
    Mathematics: 'text-blue-400 bg-blue-400/10',
    Biology: 'text-emerald-400 bg-emerald-400/10',
    Physics: 'text-purple-400 bg-purple-400/10',
    Chemistry: 'text-orange-400 bg-orange-400/10',
    English: 'text-pink-400 bg-pink-400/10',
  };
  return colors[subject] || 'text-slate-400 bg-slate-400/10';
}
