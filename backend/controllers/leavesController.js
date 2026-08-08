const db = require("../config/database");

exports.getTypes = (req, res) => {
  db.query("SELECT * FROM leave_types", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.getBalances = (req, res) => {
  const { employee_id } = req.params;
  const sql = `
    SELECT lb.*, lt.name as leave_name, lt.code as leave_code, lt.max_days
    FROM leave_balances lb
    JOIN leave_types lt ON lb.leave_type_id = lt.id
    WHERE lb.employee_id = ?
  `;
  db.query(sql, [employee_id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.getApplications = (req, res) => {
  const { employee_id } = req.query;
  let sql = `
    SELECT la.*, e.name as employee_name, lt.name as leave_name, lt.code as leave_code
    FROM leave_applications la
    JOIN employees e ON la.employee_id = e.id
    JOIN leave_types lt ON la.leave_type_id = lt.id
  `;
  const params = [];
  if (employee_id) {
    sql += " WHERE la.employee_id = ?";
    params.push(employee_id);
  }
  sql += " ORDER BY la.applied_on DESC";

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.submitApplication = (req, res) => {
  const { employee_id, leave_type_code, start_date, end_date, reason } = req.body;

  if (!employee_id || !leave_type_code || !start_date || !end_date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, reason, status)
    VALUES (?, (SELECT id FROM leave_types WHERE code = ?), ?, ?, ?, 'Pending')
  `;

  db.query(sql, [employee_id, leave_type_code, start_date, end_date, reason], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Leave submission failed" });
    }
    res.json({ message: "Leave application submitted successfully", id: result.insertId });
  });
};

exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status, approved_by } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const sql = "UPDATE leave_applications SET status = ?, approved_by = ? WHERE id = ?";
  db.query(sql, [status, approved_by, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Leave application updated successfully" });
  });
};

exports.getDashboardStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Total Employees
    const totalEmployees = await new Promise((resolve, reject) => {
      db.query("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'", (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0].count);
      });
    });

    // 2. On Leave Today
    const onLeaveTodayCount = await new Promise((resolve, reject) => {
      db.query("SELECT COUNT(DISTINCT employee_id) as count FROM leave_applications WHERE status = 'Approved' AND ? BETWEEN start_date AND end_date", [todayStr], (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0].count);
      });
    });

    // 3. Pending Approvals
    const pendingApprovals = await new Promise((resolve, reject) => {
      db.query("SELECT COUNT(*) as count FROM leave_applications WHERE status = 'Pending'", (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0].count);
      });
    });

    // 4. Leaves Taken This Month
    const leavesTakenThisMonth = await new Promise((resolve, reject) => {
      db.query("SELECT COALESCE(SUM(DATEDIFF(end_date, start_date) + 1), 0) as count FROM leave_applications WHERE status = 'Approved' AND MONTH(start_date) = MONTH(?) AND YEAR(start_date) = YEAR(?)", [todayStr, todayStr], (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0].count);
      });
    });

    // 5. On Leave Today List
    const onLeaveTodayList = await new Promise((resolve, reject) => {
      const sqlList = `
        SELECT la.employee_id, e.name, lt.code as leave_code, d.dept_name as dept, e.profile_photo as avatar
        FROM leave_applications la
        JOIN employees e ON la.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        JOIN leave_types lt ON la.leave_type_id = lt.id
        WHERE la.status = 'Approved' AND ? BETWEEN la.start_date AND la.end_date
      `;
      db.query(sqlList, [todayStr], (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(r => ({
          name: r.name,
          role: r.dept || 'General Staff',
          type: r.leave_code,
          avatar: r.avatar ? `/${r.avatar}` : null
        })));
      });
    });

    // 6. Leave By Department list
    const leaveByDept = await new Promise((resolve, reject) => {
      const sqlDept = `
        SELECT 
          d.dept_name as dept, 
          COUNT(DISTINCT e.id) as emp,
          COALESCE(SUM(CASE WHEN la.status = 'Approved' THEN (DATEDIFF(la.end_date, la.start_date) + 1) ELSE 0 END), 0) as taken,
          COALESCE(SUM(CASE WHEN la.status = 'Pending' THEN 1 ELSE 0 END), 0) as pending
        FROM departments d
        LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'Active'
        LEFT JOIN leave_applications la ON la.employee_id = e.id
        GROUP BY d.id, d.dept_name
      `;
      db.query(sqlDept, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    // 7. Leave Distribution Summary
    const leaveDist = await new Promise((resolve, reject) => {
      const sqlDist = `
        SELECT lt.name, COALESCE(SUM(DATEDIFF(la.end_date, la.start_date) + 1), 0) as value
        FROM leave_types lt
        LEFT JOIN leave_applications la ON la.leave_type_id = lt.id AND la.status = 'Approved'
        GROUP BY lt.id, lt.name
      `;
      db.query(sqlDist, (err, rows) => {
        if (err) return reject(err);
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
        resolve(rows.map((r, i) => ({
          name: r.name,
          value: r.value || 0,
          color: colors[i % colors.length]
        })));
      });
    });

    return res.status(200).json({
      success: true,
      kpis: {
        totalEmployees,
        onLeaveToday: onLeaveTodayCount,
        leavesTaken: leavesTakenThisMonth,
        pendingApprovals,
        leaveEncashment: '₹0.00'
      },
      onLeaveToday: onLeaveTodayList,
      leaveByDepartment: leaveByDept,
      leaveDistribution: leaveDist
    });

  } catch (error) {
    console.error("Failed to load leave dashboard stats:", error);
    return res.status(500).json({ success: false, message: "Internal server error loading dashboard stats" });
  }
};
