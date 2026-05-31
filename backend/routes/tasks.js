const express = require('express');
const router = express.Router();
const StudyTask = require('../models/StudyTask');

// ─── Helper: get start and end of a given day (LOCAL time, not UTC) ──
// Using local time ensures "today" means today in Ansar's timezone (UTC+3),
// so tasks flip at local midnight (12:00 AM) not UTC midnight (3:00 AM local).
function getDayRange(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0); // local midnight start

  const end = new Date(date);
  end.setHours(23, 59, 59, 999); // local midnight end

  return { start, end };
}

// ─── GET /api/tasks?date=today|tomorrow ───────────────────────
// - date=today    → all tasks whose date = today (regardless of isForTomorrow flag)
//                   This correctly shows tasks that were planned yesterday as "tomorrow"
// - date=tomorrow → tasks with isForTomorrow=true and date = tomorrow
//                   (the planning list for the next day)
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const isForTomorrow = date === 'tomorrow';

    const targetDate = new Date();
    if (isForTomorrow) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const { start, end } = getDayRange(targetDate);

    // For today: fetch ALL tasks on today's date — this includes tasks that were
    // added yesterday as "tomorrow's plan" (they have date=today, isForTomorrow=true)
    // For tomorrow: only fetch the planning items (isForTomorrow=true, date=tomorrow)
    const query = isForTomorrow
      ? { date: { $gte: start, $lte: end }, isForTomorrow: true }
      : { date: { $gte: start, $lte: end } };

    const tasks = await StudyTask.find(query).sort({ createdAt: 1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('GET /api/tasks error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
});

// ─── POST /api/tasks ──────────────────────────────────────────
// Creates a new study task
router.post('/', async (req, res) => {
  try {
    const { subject, task, duration, estimatedHours, priority, place, isForTomorrow } = req.body;

    if (!subject || !task) {
      return res.status(400).json({ success: false, message: 'subject and task are required' });
    }

    // Set the date to today or tomorrow depending on isForTomorrow
    const taskDate = new Date();
    if (isForTomorrow) {
      taskDate.setDate(taskDate.getDate() + 1);
    }
    taskDate.setHours(0, 0, 0, 0); // normalize to local start of day

    const newTask = await StudyTask.create({
      date: taskDate,
      subject,
      task,
      duration: duration || '',
      estimatedHours: estimatedHours || 1,
      priority: priority || 'medium',
      place: place || '',
      completed: false,
      isForTomorrow: isForTomorrow || false,
    });

    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    console.error('POST /api/tasks error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating task' });
  }
});

// ─── PATCH /api/tasks/:id ─────────────────────────────────────
// Updates a task — primarily used to toggle completed status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // can be { completed: true/false } or other fields

    const task = await StudyTask.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true } // return the updated document
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('PATCH /api/tasks/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating task' });
  }
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await StudyTask.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('DELETE /api/tasks/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
});

module.exports = router;
