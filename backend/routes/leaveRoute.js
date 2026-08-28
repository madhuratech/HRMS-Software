const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get Leave Types
router.get('/types', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM leave_types');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Leave Type
router.post('/types', async (req, res) => {
  const { name, daysAllowed, isPaid } = req.body;
  try {
    await db.promise().query('INSERT INTO leave_types (name, days_allowed, is_paid) VALUES (?, ?, ?)', [name, daysAllowed, isPaid !== false]);
    res.json({ message: 'Leave type created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Leave Balances
router.get('/balances/:employeeId', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT b.*, t.name as leave_type 
      FROM leave_balances b
      JOIN leave_types t ON b.leave_type_id = t.id
      WHERE b.employee_id = ?
    `, [req.params.employeeId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Leave Applications
router.get('/applications', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT a.*, e.name as employee_name, t.name as leave_type
      FROM leave_applications a
      JOIN employees e ON a.employee_id = e.id
      JOIN leave_types t ON a.leave_type_id = t.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Leave Application
router.post('/applications', async (req, res) => {
  const { employeeId, leaveTypeId, startDate, endDate, totalDays, reason } = req.body;
  try {
    await db.promise().query(`
      INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [employeeId, leaveTypeId, startDate, endDate, totalDays, reason]);
    res.json({ message: 'Leave application submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve/Reject Leave Application
router.put('/applications/:id/status', async (req, res) => {
  const { status, approvedBy } = req.body; // status: Approved / Rejected
  try {
    await db.promise().query('UPDATE leave_applications SET status = ?, approved_by = ? WHERE id = ?', [status, approvedBy, req.params.id]);
    res.json({ message: `Leave application ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
