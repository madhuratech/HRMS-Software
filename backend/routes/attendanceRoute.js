const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get Daily Attendance
router.get('/daily', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT a.*, e.name as employee_name, d.dept_name as department, des.role_name as designation 
      FROM daily_attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations des ON e.designation_id = des.id
      ORDER BY a.date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Attendance
router.post('/mark', async (req, res) => {
  const { employeeId, date, punchIn, punchOut, status, workHours, workDone } = req.body;
  try {
    await db.promise().query(`
      INSERT INTO daily_attendance (employee_id, date, punch_in, punch_out, status, work_hours, work_done) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      punch_out = VALUES(punch_out), status = VALUES(status), work_hours = VALUES(work_hours), work_done = VALUES(work_done)
    `, [employeeId, date, punchIn, punchOut, status, workHours, workDone || null]);
    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Regularization Requests
router.get('/regularization', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT r.*, e.name as employee_name 
      FROM regularization_requests r
      JOIN employees e ON r.employee_id = e.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/regularization', async (req, res) => {
  const { employeeId, date, requestedPunchIn, requestedPunchOut, reason } = req.body;
  try {
    await db.promise().query(`
      INSERT INTO regularization_requests (employee_id, date, requested_punch_in, requested_punch_out, reason)
      VALUES (?, ?, ?, ?, ?)
    `, [employeeId, date, requestedPunchIn, requestedPunchOut, reason]);
    res.json({ message: 'Regularization requested successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Shift Roster
router.get('/roster', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sr.*, e.name as employee_name, sm.shift_name, sm.start_time, sm.end_time
      FROM shift_roster sr
      JOIN employees e ON sr.employee_id = e.id
      JOIN shift_management sm ON sr.shift_id = sm.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/roster', async (req, res) => {
  const { employeeId, shiftId, startDate, endDate } = req.body;
  try {
    await db.query(`
      INSERT INTO shift_roster (employee_id, shift_id, start_date, end_date)
      VALUES (?, ?, ?, ?)
    `, [employeeId, shiftId, startDate, endDate]);
    res.json({ message: 'Shift roster updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
