/**
 * resetData.js — Wipe all user-generated data from MongoDB
 *
 * Clears:
 *   ✓ StudyTask        (all tasks)
 *   ✓ StudyReflection  (all end-of-day reflections)
 *   ✓ MentorFeedback   (all mentor messages)
 *   ✓ QuranProgress    (all daily progress records)
 *   ✓ QuranPlan        (all reading plan items)
 *   ✓ QuranReflection  (all Quran reflections)
 *   ✓ SalahRecord      (all prayer records)
 *
 * Keeps:
 *   ✗ Settings         (exam date, quran target, mentor code — intentionally preserved)
 *
 * Usage:
 *   node scripts/resetData.js
 *
 * Run this from the backend/ folder.
 */

require('dotenv').config({ path: '../.env' });
// Also try the local .env in case you run from inside backend/
require('dotenv').config();

const mongoose = require('mongoose');

const StudyTask       = require('../models/StudyTask');
const StudyReflection = require('../models/StudyReflection');
const MentorFeedback  = require('../models/MentorFeedback');
const QuranProgress   = require('../models/QuranProgress');
const QuranPlan       = require('../models/QuranPlan');
const QuranReflection = require('../models/QuranReflection');
const SalahRecord     = require('../models/SalahRecord');

async function resetData() {
  console.log('\n🔄  Connecting to MongoDB...');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  Connected.\n');

  const collections = [
    { model: StudyTask,       name: 'StudyTask       (tasks)'              },
    { model: StudyReflection, name: 'StudyReflection (study reflections)'  },
    { model: MentorFeedback,  name: 'MentorFeedback  (mentor messages)'    },
    { model: QuranProgress,   name: 'QuranProgress   (quran daily records)'},
    { model: QuranPlan,       name: 'QuranPlan       (reading plans)'      },
    { model: QuranReflection, name: 'QuranReflection (quran reflections)'  },
    { model: SalahRecord,     name: 'SalahRecord     (prayer records)'     },
  ];

  console.log('🗑️   Clearing all user data...\n');

  for (const { model, name } of collections) {
    const result = await model.deleteMany({});
    console.log(`   ✓  ${name} — deleted ${result.deletedCount} document(s)`);
  }

  console.log('\n✅  All user data cleared.');
  console.log('ℹ️   Settings (exam date, quran target, mentor code) were NOT touched.\n');

  await mongoose.disconnect();
  console.log('🔌  Disconnected from MongoDB.\n');
}

resetData().catch((err) => {
  console.error('\n❌  Reset failed:', err.message);
  process.exit(1);
});
