// ============================================================
// MOCK DATA — All data is frontend-only for now
// TODO: Replace all mock data with real API calls to backend
// ============================================================

export const EXAM_DATE = new Date('2026-07-01T08:00:00'); // TODO: Connect exam date from backend

// ─── Quran Verses ────────────────────────────────────────────
export const quranVerses = [
  {
    arabic: 'وَعَلَى اللَّهِ فَتَوَكَّلُوا إِن كُنتُم مُّؤْمِنِينَ',
    translation: 'And upon Allah rely, if you should be believers.',
    reference: 'Surah Al-Ma\'idah 5:23',
    theme: 'tawakkul',
  },
  {
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship will be ease.',
    reference: 'Surah Ash-Sharh 94:6',
    theme: 'hope',
  },
  {
    arabic: 'وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ',
    translation: 'And be patient, and your patience is not but through Allah.',
    reference: 'Surah An-Nahl 16:127',
    theme: 'patience',
  },
  {
    arabic: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ',
    translation: 'And when you have decided, then rely upon Allah.',
    reference: 'Surah Ali \'Imran 3:159',
    theme: 'tawakkul',
  },
  {
    arabic: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ',
    translation: 'Do not weaken and do not grieve, and you will be superior.',
    reference: 'Surah Ali \'Imran 3:139',
    theme: 'perseverance',
  },
  {
    arabic: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
    translation: 'Allah will raise those who have believed among you and those who were given knowledge, by degrees.',
    reference: 'Surah Al-Mujadila 58:11',
    theme: 'knowledge',
  },
];

// ─── Hadith ──────────────────────────────────────────────────
export const hadiths = [
  {
    text: 'Tie your camel first, then put your trust in Allah.',
    source: 'Tirmidhi',
    theme: 'tawakkul',
  },
  {
    text: 'Seeking knowledge is an obligation upon every Muslim.',
    source: 'Ibn Majah',
    theme: 'knowledge',
  },
  {
    text: 'The most beloved deeds to Allah are those done consistently, even if they are small.',
    source: 'Bukhari & Muslim',
    theme: 'consistency',
  },
  {
    text: 'Take advantage of five before five: your youth before your old age, your health before your illness, your wealth before your poverty, your free time before your busyness, and your life before your death.',
    source: 'Al-Hakim',
    theme: 'discipline',
  },
  {
    text: 'Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise.',
    source: 'Muslim',
    theme: 'knowledge',
  },
  {
    text: 'Be in this world as though you were a stranger or a traveler.',
    source: 'Bukhari',
    theme: 'focus',
  },
];

// ─── Today's Tasks ───────────────────────────────────────────
// TODO: GET today's tasks from backend — GET /api/tasks?date=today
export const todaysTasks = [
  { id: 1, subject: 'Mathematics', task: 'Complete Chapter 7 — Integration', duration: '2 hours', completed: true },
  { id: 2, subject: 'Biology', task: 'Review Cell Division notes', duration: '1.5 hours', completed: true },
  { id: 3, subject: 'Physics', task: 'Practice past paper questions (Mechanics)', duration: '1 hour', completed: false },
  { id: 4, subject: 'Chemistry', task: 'Memorize organic reaction mechanisms', duration: '45 min', completed: false },
  { id: 5, subject: 'English', task: 'Write essay draft — Climate Change', duration: '1 hour', completed: false },
];

// ─── Tomorrow's Plan ─────────────────────────────────────────
// TODO: GET tomorrow's plan from backend — GET /api/tasks?date=tomorrow
export const tomorrowPlan = [
  { id: 1, subject: 'Biology', task: 'Genetics chapter full review', estimatedHours: 2, priority: 'high' },
  { id: 2, subject: 'Mathematics', task: 'Chapter 8 — Differentiation practice', estimatedHours: 1.5, priority: 'high' },
  { id: 3, subject: 'Physics', task: 'Electricity & Magnetism notes', estimatedHours: 1, priority: 'medium' },
];

// ─── Salah Data ───────────────────────────────────────────────
// TODO: GET salah data from backend — GET /api/salah?date=today
export const prayersData = [
  { id: 'fajr', name: 'Fajr', time: '5:12 AM', completed: true, jamaah: true, notes: '' },
  { id: 'dhuhr', name: 'Dhuhr', time: '12:45 PM', completed: true, jamaah: false, notes: 'Prayed at home' },
  { id: 'asr', name: 'Asr', time: '4:15 PM', completed: true, jamaah: true, notes: '' },
  { id: 'maghrib', name: 'Maghrib', time: '6:52 PM', completed: false, jamaah: false, notes: '' },
  { id: 'isha', name: 'Isha', time: '8:20 PM', completed: false, jamaah: false, notes: '' },
];

// ─── Weekly Salah Stats ───────────────────────────────────────
export const weeklySalahStats = [
  { day: 'Sat', completed: 5, jamaah: 4 },
  { day: 'Sun', completed: 5, jamaah: 5 },
  { day: 'Mon', completed: 4, jamaah: 3 },
  { day: 'Tue', completed: 5, jamaah: 4 },
  { day: 'Wed', completed: 5, jamaah: 5 },
  { day: 'Thu', completed: 3, jamaah: 2 },
  { day: 'Fri', completed: 5, jamaah: 5 },
];

// ─── Quran Progress ───────────────────────────────────────────
// TODO: GET Quran progress from backend — GET /api/quran/progress
export const quranProgress = {
  todayGoal: '5 pages',
  todayCompleted: 3,
  todayTarget: 5,
  currentStreak: 12,
  weeklyData: [
    { day: 'Sat', pages: 5 },
    { day: 'Sun', pages: 5 },
    { day: 'Mon', pages: 3 },
    { day: 'Tue', pages: 5 },
    { day: 'Wed', pages: 4 },
    { day: 'Thu', pages: 5 },
    { day: 'Fri', pages: 5 },
  ],
  monthlyConsistency: 87, // percentage
};

// ─── Study Stats ──────────────────────────────────────────────
export const studyStats = {
  todayHours: 3.5,
  targetHours: 6,
  currentStreak: 18,
  weeklyData: [
    { day: 'Sat', hours: 5 },
    { day: 'Sun', hours: 6 },
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 5.5 },
    { day: 'Wed', hours: 3.5 },
    { day: 'Thu', hours: 6 },
    { day: 'Fri', hours: 4.5 },
  ],
  monthlyConsistency: 82,
};

// ─── Mentor Feedback ─────────────────────────────────────────
// TODO: Fetch mentor feedback from backend — GET /api/mentor/feedback
export const mentorFeedback = {
  message: 'Good progress today, Ansar. Your consistency in Mathematics is showing. Focus more on Biology tomorrow — especially Genetics. Keep up the Fajr streak, it sets the tone for the whole day.',
  mentorName: 'Ahmed',
  timestamp: 'Today, 9:30 PM',
};

// ─── Dashboard Stats ─────────────────────────────────────────
export const dashboardStats = {
  studyStreak: 18,
  quranStreak: 12,
  salahStreak: 21,
  overallStreak: 12,
};

// ─── Analytics ───────────────────────────────────────────────
// TODO: Fetch analytics from backend — GET /api/analytics
export const analyticsData = {
  studyConsistency: 82,
  quranConsistency: 87,
  salahConsistency: 91,
  monthlyStudy: [
    { week: 'W1', hours: 28 },
    { week: 'W2', hours: 32 },
    { week: 'W3', hours: 25 },
    { week: 'W4', hours: 35 },
  ],
};
