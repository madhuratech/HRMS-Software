const express = require('express');
const router = express.Router();
const db = require('../config/database');

// --- GOALS ---
router.get('/goals', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT g.*, e.first_name, e.last_name 
      FROM goals g 
      LEFT JOIN employees e ON g.employee_id = e.id 
      ORDER BY g.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching goals' });
  }
});

router.post('/goals', async (req, res) => {
  const { employee_id, title, description, start_date, due_date, status, progress } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO goals (employee_id, title, description, start_date, due_date, status, progress) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [employee_id, title, description, start_date, due_date, status || 'pending', progress || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Goal created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating goal' });
  }
});

// --- KPIS ---
router.get('/kpis', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT k.*, e.first_name, e.last_name 
      FROM kpis k 
      LEFT JOIN employees e ON k.employee_id = e.id 
      ORDER BY k.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching KPIs' });
  }
});

router.post('/kpis', async (req, res) => {
  const { employee_id, title, target_value, achieved_value, weightage } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO kpis (employee_id, title, target_value, achieved_value, weightage) VALUES (?, ?, ?, ?, ?)',
      [employee_id, title, target_value, achieved_value, weightage || 100]
    );
    res.status(201).json({ id: result.insertId, message: 'KPI created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating KPI' });
  }
});

// --- KRAS ---
router.get('/kras', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT k.*, e.first_name, e.last_name 
      FROM kras k 
      LEFT JOIN employees e ON k.employee_id = e.id 
      ORDER BY k.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching KRAs' });
  }
});

router.post('/kras', async (req, res) => {
  const { employee_id, title, description } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO kras (employee_id, title, description) VALUES (?, ?, ?)',
      [employee_id, title, description]
    );
    res.status(201).json({ id: result.insertId, message: 'KRA created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating KRA' });
  }
});

// --- APPRAISALS ---
router.get('/appraisals', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT a.*, e.first_name, e.last_name 
      FROM appraisals a 
      LEFT JOIN employees e ON a.employee_id = e.id 
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching appraisals' });
  }
});

router.post('/appraisals', async (req, res) => {
  const { employee_id, appraisal_cycle, rating, feedback, status } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO appraisals (employee_id, appraisal_cycle, rating, feedback, status) VALUES (?, ?, ?, ?, ?)',
      [employee_id, appraisal_cycle, rating, feedback, status || 'draft']
    );
    res.status(201).json({ id: result.insertId, message: 'Appraisal created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating appraisal' });
  }
});

// --- REVIEWS ---
router.get('/reviews', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT r.*, 
        e1.first_name AS emp_first_name, e1.last_name AS emp_last_name,
        e2.first_name AS rev_first_name, e2.last_name AS rev_last_name
      FROM reviews r 
      LEFT JOIN employees e1 ON r.employee_id = e1.id 
      LEFT JOIN employees e2 ON r.reviewer_id = e2.id 
      ORDER BY r.review_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

router.post('/reviews', async (req, res) => {
  const { employee_id, reviewer_id, review_date, comments, rating } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO reviews (employee_id, reviewer_id, review_date, comments, rating) VALUES (?, ?, ?, ?, ?)',
      [employee_id, reviewer_id, review_date, comments, rating]
    );
    res.status(201).json({ id: result.insertId, message: 'Review created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating review' });
  }
});

// --- FEEDBACK ---
router.get('/feedback', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT f.*, 
        e1.first_name AS emp_first_name, e1.last_name AS emp_last_name,
        e2.first_name AS prov_first_name, e2.last_name AS prov_last_name
      FROM feedback f 
      LEFT JOIN employees e1 ON f.employee_id = e1.id 
      LEFT JOIN employees e2 ON f.provider_id = e2.id 
      ORDER BY f.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching feedback' });
  }
});

router.post('/feedback', async (req, res) => {
  const { employee_id, provider_id, feedback_text, feedback_type } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO feedback (employee_id, provider_id, feedback_text, feedback_type) VALUES (?, ?, ?, ?)',
      [employee_id, provider_id, feedback_text, feedback_type || 'positive']
    );
    res.status(201).json({ id: result.insertId, message: 'Feedback created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating feedback' });
  }
});

module.exports = router;
