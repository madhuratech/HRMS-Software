const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all training programs
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM training_programs ORDER BY start_date DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching training programs' });
  }
});

// POST new training program
router.post('/', async (req, res) => {
  const { title, description, trainer, start_date, end_date, status } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO training_programs (title, description, trainer, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, trainer, start_date, end_date, status || 'planned']
    );
    res.status(201).json({ id: result.insertId, message: 'Training created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating training' });
  }
});

module.exports = router;
