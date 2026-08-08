const db = require("../config/database");

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Execute queries in parallel using Promise.all
    const [
      totalEmployeesRow,
      totalDepartmentsRow,
      totalBranchesRow,
      totalLeavesRow,
      attendanceTodayRow,
      totalProjectsRow,
      completedProjectsRow,
      totalClientsRow,
      totalRevenueRow,
      departmentSummary,
      recentActivity,
      upcomingHolidays,
      upcomingBirthdays,
      performanceEmployees,
      recentLeaves
    ] = await Promise.all([
      query("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'"),
      query("SELECT COUNT(*) as count FROM departments"),
      query("SELECT COUNT(*) as count FROM branches"),
      query("SELECT COUNT(*) as count FROM leave_applications WHERE status = 'Approved' AND ? BETWEEN start_date AND end_date", [today]),
      query("SELECT COUNT(DISTINCT employee_id) as count FROM attendance WHERE DATE(punch_time) = ?", [today]),
      query("SELECT COUNT(*) as count FROM projects"),
      query("SELECT COUNT(*) as count FROM projects WHERE status = 'Completed'"),
      query("SELECT COUNT(DISTINCT client) as count FROM projects"),
      query("SELECT COALESCE(SUM(budget), 0) as count FROM projects"),
      query(`
        SELECT d.dept_name as dept, COUNT(e.id) as emp 
        FROM departments d 
        LEFT JOIN employees e ON e.department_id = d.id 
        GROUP BY d.id, d.dept_name
      `),
      query(`
        SELECT a.punch_type, a.punch_time, e.name as employee_name 
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        ORDER BY a.punch_time DESC LIMIT 5
      `),
      query("SELECT holiday_date as date, name FROM holidays WHERE holiday_date >= ? ORDER BY holiday_date ASC LIMIT 4", [today]),
      query(`
        SELECT name, DATE_FORMAT(dob, '%M %d') as date
        FROM employees 
        WHERE dob IS NOT NULL
        ORDER BY DATE_FORMAT(dob, '%m%d') ASC
        LIMIT 4
      `),
      query(`
        SELECT 
          e.name, 
          d.dept_name as dept, 
          desg.role_name as designation, 
          COALESCE(ROUND(AVG(g.completion_percentage)/20, 2), 4.00) as score,
          CONCAT(COALESCE(ROUND(AVG(g.completion_percentage)), 80), '%') as goals,
          COALESCE(ROUND(AVG(g.completion_percentage)/20), 4) as stars,
          '↑ 3.2%' as trend, 
          1 as isUp 
        FROM employees e 
        LEFT JOIN departments d ON e.department_id = d.id 
        LEFT JOIN designations desg ON e.designation_id = desg.id 
        LEFT JOIN goals g ON e.id = g.employee_id
        GROUP BY e.id, e.name, d.dept_name, desg.role_name
        LIMIT 5
      `),
      query(`
        SELECT e.name as employee_name, d.dept_name, lt.name as leave_name, DATEDIFF(la.end_date, la.start_date) + 1 as duration
        FROM leave_applications la
        JOIN employees e ON la.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        JOIN leave_types lt ON la.leave_type_id = lt.id
        WHERE la.status = 'Approved' AND ? BETWEEN la.start_date AND la.end_date
      `, [today])
    ]);

    return res.status(200).json({
      totalEmployees: totalEmployeesRow[0]?.count || 0,
      totalDepartments: totalDepartmentsRow[0]?.count || 0,
      totalBranches: totalBranchesRow[0]?.count || 0,
      totalLeaves: totalLeavesRow[0]?.count || 0,
      attendanceToday: attendanceTodayRow[0]?.count || 0,
      totalProjects: totalProjectsRow[0]?.count || 0,
      completedProjects: completedProjectsRow[0]?.count || 0,
      totalClients: totalClientsRow[0]?.count || 0,
      totalRevenue: totalRevenueRow[0]?.count || 0,
      departmentSummary,
      recentActivity,
      upcomingHolidays,
      upcomingBirthdays,
      performanceEmployees,
      recentLeaves
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error fetching dashboard statistics" });
  }
};
