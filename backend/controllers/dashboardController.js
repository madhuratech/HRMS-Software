const db = require("../config/database");

exports.getStats = (req, res) => {
  const stats = {
    totalEmployees: 0,
    totalDepartments: 0,
    totalBranches: 0,
    totalLeaves: 0,
    attendanceToday: 0,
    totalProjects: 0,
    completedProjects: 0,
    totalClients: 102,
    departmentSummary: [],
    recentActivity: [],
    upcomingHolidays: [],
    upcomingBirthdays: [],
    performanceEmployees: [],
    recentLeaves: []
  };

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
    `},
    { key: 'upcomingHolidays', sql: `
        SELECT holiday_date as date, name 
        FROM holidays 
        ORDER BY holiday_date ASC LIMIT 4
    `},
    { key: 'upcomingBirthdays', sql: `
        SELECT name, 'Today' as date 
        FROM employees 
        LIMIT 4
    `},
    { key: 'performanceEmployees', sql: `
        SELECT e.name, d.dept_name as dept, desg.role_name as designation, '4.25' as score, '85%' as goals, 4 as stars, '↑ 3.2%' as trend, 1 as isUp 
        FROM employees e 
        LEFT JOIN departments d ON e.department_id = d.id 
        LEFT JOIN designations desg ON e.designation_id = desg.id 
        LIMIT 5
    `},
    { key: 'recentLeaves', sql: `
        SELECT e.name as employee_name, d.dept_name, lt.name as leave_name, DATEDIFF(la.end_date, la.start_date) + 1 as duration
        FROM leave_applications la
        JOIN employees e ON la.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        JOIN leave_types lt ON la.leave_type_id = lt.id
        WHERE la.status = 'Approved' AND CURRENT_DATE BETWEEN la.start_date AND la.end_date
    `}
  ];

  let completed = 0;
  queries.forEach(q => {
    db.query(q.sql, (err, rows) => {
      if (err) {
        console.error(`Error running query for dashboard: ${q.key}`, err);
      } else {
        if (['departmentSummary', 'recentActivity', 'upcomingHolidays', 'upcomingBirthdays', 'performanceEmployees', 'recentLeaves'].includes(q.key)) {
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
};
