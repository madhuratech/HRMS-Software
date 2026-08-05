const express = require("express");
const router = express.Router();
const db = require("../config/database");

/**
 * GET DASHBOARD WIDGETS AND STATISTICS
 */
router.get("/stats", (req, res) => {
  const stats = {
    totalEmployees: 0,
    totalDepartments: 0,
    totalBranches: 0,
    totalLeaves: 0,
    attendanceToday: 0,
    departmentSummary: [],
    recentActivity: []
  };

  // Queries sequence to build stats payload
  const queries = [
    { key: 'totalEmployees', sql: "SELECT COUNT(*) as count FROM employees WHERE status = 'Active'" },
    { key: 'totalDepartments', sql: "SELECT COUNT(*) as count FROM departments" },
    { key: 'totalBranches', sql: "SELECT COUNT(*) as count FROM branches" },
    { key: 'totalLeaves', sql: "SELECT COUNT(*) as count FROM leave_applications WHERE status = 'Approved' AND CURRENT_DATE BETWEEN start_date AND end_date" },
    { key: 'attendanceToday', sql: "SELECT COUNT(DISTINCT employee_id) as count FROM attendance WHERE DATE(punch_time) = CURRENT_DATE" },
    { key: 'totalProjects', sql: "SELECT COUNT(*) as count FROM projects" },
    { key: 'completedProjects', sql: "SELECT COUNT(*) as count FROM projects WHERE status = 'Completed'" },
    { key: 'totalClients', sql: "SELECT 102 as count" },
    { key: 'departmentSummary', sql: `
        SELECT d.dept_name as dept, COUNT(e.id) as emp 
        FROM departments d 
        LEFT JOIN employees e ON e.department_id = d.id 
        GROUP BY d.id
    `},
    { key: 'recentActivity', sql: `
        SELECT punch_type, punch_time, e.name as employee_name 
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        ORDER BY punch_time DESC LIMIT 5
    `}
  ];

  let completed = 0;
  queries.forEach(q => {
    db.query(q.sql, (err, rows) => {
      if (err) {
        console.error(`Error running query for dashboard: ${q.key}`, err);
      } else {
        if (q.key === 'departmentSummary' || q.key === 'recentActivity') {
          stats[q.key] = rows;
        } else {
          stats[q.key] = rows[0]?.count || 0;
        }
      }
      completed++;
      if (completed === queries.length) {
        res.json(stats);
      }
    });
  });
});

module.exports = router;
