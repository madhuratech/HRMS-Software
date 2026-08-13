const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { authenticateJWT } = require("../middlewares/auth");

// Standard attendance endpoints
router.post("/punch", authenticateJWT, attendanceController.punch);
router.get("/today-status", authenticateJWT, attendanceController.getTodayStatus);
router.get("/recent/:employee_id", authenticateJWT, attendanceController.getRecent);
router.get("/daily", authenticateJWT, attendanceController.getDailyStats);
router.get("/gps-feed", authenticateJWT, attendanceController.getGPSFeed);

// Location Master CRUD (Admin only or authorized roles could be checked via role check if needed, but JWT check is core security)
router.get("/punch-locations", authenticateJWT, attendanceController.getPunchLocations);
router.get("/punch-locations/:id", authenticateJWT, attendanceController.getPunchLocationById);
router.post("/punch-locations", authenticateJWT, attendanceController.createPunchLocation);
router.put("/punch-locations/:id", authenticateJWT, attendanceController.updatePunchLocation);
router.delete("/punch-locations/:id", authenticateJWT, attendanceController.deletePunchLocation);
router.patch("/punch-locations/:id/status", authenticateJWT, attendanceController.togglePunchLocationStatus);

// Reports & Export
router.get("/reports", authenticateJWT, attendanceController.getGPSReport);
router.get("/reports/pdf", authenticateJWT, attendanceController.exportGPSReportPDF);
router.get("/reports/excel", authenticateJWT, attendanceController.exportGPSReportExcel);

// Daily Attendance Record Management
router.put("/records/:employeeId/:date", authenticateJWT, attendanceController.updateAttendanceRecord);
router.delete("/records/:employeeId/:date", authenticateJWT, attendanceController.deleteAttendanceRecord);

// Regularization Requests
router.get("/regularization", authenticateJWT, (req, res) => {
  const db = require("../config/database");
  const { status } = req.query;
  let sql = `
    SELECT 
      ar.*,
      COALESCE(e.name, ar.employee_name) as employee_name,
      e.profile_photo as profile_photo
    FROM attendance_regularizations ar
    LEFT JOIN employees e ON ar.employee_id = e.id
  `;
  const params = [];
  if (status && status !== 'All') {
    sql += ' WHERE LOWER(ar.status) = LOWER(?)';
    params.push(status);
  }
  sql += ' ORDER BY ar.id DESC';
  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.post("/regularization", authenticateJWT, (req, res) => {
  const db = require("../config/database");
  const { employee_id, date, type, reason, time } = req.body;
  const sql = `
    INSERT INTO attendance_regularizations (employee_id, date, type, reason, status, time, created_at)
    VALUES (?, ?, ?, ?, 'Pending', ?, NOW())
  `;
  db.query(sql, [employee_id || 1, date || DATE_FORMAT(NOW(), '%d %b, %Y'), type || 'Late Arrival', reason, time || '09:30 AM'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Regularization request submitted successfully', id: result.insertId });
  });
});

router.put("/regularization/:id/status", authenticateJWT, (req, res) => {
  const db = require("../config/database");
  const { id } = req.params;
  const { status } = req.body;
  db.query('UPDATE attendance_regularizations SET status = ? WHERE id = ?', [status, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Status updated successfully' });
  });
});

// Overtime Requests
router.get("/overtime", authenticateJWT, (req, res) => {
  const db = require("../config/database");
  const sql = `
    SELECT 
      o.*,
      COALESCE(e.name, o.employee_name) as employee_name,
      e.profile_photo as profile_photo
    FROM overtime_records o
    LEFT JOIN employees e ON o.employee_id = e.id
    ORDER BY o.id DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.post("/overtime", authenticateJWT, (req, res) => {
  const db = require("../config/database");
  const { employee_id, employee_name, date, hours, reason } = req.body;
  const sql = `
    INSERT INTO overtime_records (employee_id, employee_name, date, hours, reason, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'Pending', NOW())
  `;
  db.query(sql, [employee_id || 1, employee_name || 'Super Admin', date, hours, reason || 'N/A'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Overtime logged successfully', id: result.insertId });
  });
});

router.put("/overtime/:id/status", authenticateJWT, (req, res) => {
  const db = require("../config/database");
  const { id } = req.params;
  const { status } = req.body;
  db.query('UPDATE overtime_records SET status = ? WHERE id = ?', [status, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Overtime status updated successfully' });
  });
});

router.delete("/overtime/:id", authenticateJWT, (req, res) => {
  const db = require("../config/database");
  const { id } = req.params;
  db.query('DELETE FROM overtime_records WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Overtime record deleted successfully' });
  });
});

// Late Arrivals
router.get("/late-arrivals", authenticateJWT, (req, res) => {
  const db = require("../config/database");
  const sql = `
    SELECT 
      a.id,
      e.name as employee,
      e.profile_photo as avatar,
      DATE_FORMAT(a.date, '%b %d, %Y') as date,
      '09:00 AM' as expected,
      COALESCE(TIME_FORMAT(a.punch_in, '%h:%i %p'), '09:30 AM') as checkIn,
      CONCAT('00h ', COALESCE(TIMESTAMPDIFF(MINUTE, '09:00:00', a.punch_in), 30), 'm') as delay,
      COALESCE(a.notes, 'Traffic delay') as reason,
      'Late' as status
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    ORDER BY a.id DESC
    LIMIT 20
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Shift Roster
router.get("/roster", authenticateJWT, (req, res) => {
  const db = require("../config/database");
  const sql = `
    SELECT 
      e.id,
      e.name as employee,
      e.profile_photo as avatar,
      COALESCE(e.employee_code, CONCAT('EMP00', e.id)) as empId
    FROM employees e
    WHERE e.status = 'Active'
    LIMIT 10
  `;
  db.query(sql, (err, employees) => {
    if (err) return res.status(500).json(err);
    const days = [
      { day: 'Mon', date: '20 May', shift: 'General Shift', time: '09:00 AM - 06:00 PM', type: 'general' },
      { day: 'Tue', date: '21 May', shift: 'General Shift', time: '09:00 AM - 06:00 PM', type: 'general' },
      { day: 'Wed', date: '22 May', shift: 'General Shift', time: '09:00 AM - 06:00 PM', type: 'general' },
      { day: 'Thu', date: '23 May', shift: 'General Shift', time: '09:00 AM - 06:00 PM', type: 'general' },
      { day: 'Fri', date: '24 May', shift: 'General Shift', time: '09:00 AM - 06:00 PM', type: 'general' },
      { day: 'Sat', date: '25 May', shift: 'Weekly Off', time: '--', type: 'off' },
      { day: 'Sun', date: '26 May', shift: 'Weekly Off', time: '--', type: 'off' }
    ];
    const roster = employees.map(emp => ({
      id: emp.id,
      employee: emp.employee,
      avatar: emp.avatar,
      empId: emp.empId,
      shifts: days
    }));
    res.json(roster);
  });
});

module.exports = router;
