const db = require("../config/database");

exports.getTypes = (req, res) => {
  db.query("SELECT * FROM leave_types", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.createType = (req, res) => {
  const { name, code, desc, maxDays, carryForward, status } = req.body;
  const sql = `
    INSERT INTO leave_types (name, code, description, max_days, carry_forward, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [name, code, desc || '', maxDays || 12, carryForward ? 1 : 0, status || 'Active'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Leave type created successfully", id: result.insertId });
  });
};

exports.updateType = (req, res) => {
  const { id } = req.params;
  const { name, code, desc, maxDays, carryForward, status } = req.body;
  const sql = `
    UPDATE leave_types
    SET name = ?, code = ?, description = ?, max_days = ?, carry_forward = ?, status = ?
    WHERE id = ?
  `;
  db.query(sql, [name, code, desc || '', maxDays || 12, carryForward ? 1 : 0, status || 'Active', id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Leave type updated successfully" });
  });
};

exports.deleteType = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM leave_types WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Leave type deleted successfully" });
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

exports.getAllBalances = async (req, res) => {
  try {
    const IdentityService = require("../services/IdentityService");
    const authIdentifier = (req.user && (req.user.email || req.user.userId || req.user.id || req.user.employeeId || req.user.employee_id)) || (req.headers && req.headers['x-employee-id']) || 1;
    const identity = await IdentityService.resolveUser(authIdentifier);

    const userRole = (identity?.role || req.user?.role || req.headers['x-user-role'] || 'EMPLOYEE').toUpperCase().replace(/[\s_-]+/g, '');
    const currentEmpId = identity?.employeeId || req.user?.employeeId || req.user?.employee_id;
    const currentTeamId = identity?.teamId;

    let whereClause = "WHERE e.status = 'Active'";
    const params = [];

    // Role-based scoping:
    // 1. SUPER_ADMIN / ADMIN / HR_MANAGER: View all employees
    // 2. TEAM_LEADER: View only members of their team (e.team_id = currentTeamId OR e.id = currentEmpId OR e.team_id IN (SELECT id FROM teams WHERE team_lead_id = ?))
    // 3. EMPLOYEE: View only their own balance
    if (['SUPERADMIN', 'ADMIN', 'HR', 'HRMANAGER', 'HRADMIN', 'BRANCHMANAGER'].includes(userRole)) {
      // Full view - no extra filtering
    } else if (['TEAMLEADER', 'TEAMLEAD', 'LEAD'].includes(userRole)) {
      whereClause += ` AND (
        (e.team_id IS NOT NULL AND e.team_id = ?) 
        OR e.id = ? 
        OR e.team_id IN (SELECT id FROM teams WHERE team_lead_id = ?)
      )`;
      params.push(currentTeamId || 0, currentEmpId || 0, currentEmpId || 0);
    } else {
      // Standard employee
      whereClause += ` AND e.id = ?`;
      params.push(currentEmpId || 0);
    }

    const sql = `
      SELECT 
        e.id as employee_id,
        e.name as employee_name,
        e.profile_photo,
        COALESCE(d.dept_name, 'General') as dept,
        COALESCE(SUM(CASE WHEN lt.code = 'CL' THEN lb.days_remaining ELSE 0 END), 0) as cl,
        COALESCE(SUM(CASE WHEN lt.code = 'SL' THEN lb.days_remaining ELSE 0 END), 0) as sl,
        COALESCE(SUM(CASE WHEN lt.code IN ('EL', 'PL') THEN lb.days_remaining ELSE 0 END), 0) as el,
        COALESCE(SUM(CASE WHEN lt.code = 'COMP' THEN lb.days_remaining ELSE 0 END), 0) as comp
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN leave_balances lb ON lb.employee_id = e.id
      LEFT JOIN leave_types lt ON lb.leave_type_id = lt.id
      ${whereClause}
      GROUP BY e.id, e.name, e.profile_photo, d.dept_name
      ORDER BY (e.id = ?) DESC, e.name ASC
    `;
    params.push(currentEmpId || 0);

    db.query(sql, params, (err, rows) => {
      if (err) {
        console.error("Error fetching leave balances:", err);
        return res.status(500).json({ success: false, message: "Error fetching leave balances", error: err.message });
      }

      let totalCL = 0, totalSL = 0, totalEL = 0, totalComp = 0;
      const formatted = (rows || []).map(r => {
        const cl = parseFloat(r.cl) || 0;
        const sl = parseFloat(r.sl) || 0;
        const el = parseFloat(r.el) || 0;
        const comp = parseFloat(r.comp) || 0;

        totalCL += cl;
        totalSL += sl;
        totalEL += el;
        totalComp += comp;

        return {
          id: r.employee_id,
          name: r.employee_name,
          profile_photo: r.profile_photo,
          dept: r.dept,
          cl,
          sl,
          el,
          comp,
          total: cl + sl + el + comp
        };
      });

      return res.json({
        success: true,
        summary: {
          cl: `${totalCL} Days`,
          sl: `${totalSL} Days`,
          el: `${totalEL} Days`,
          comp: `${totalComp} Hours`
        },
        records: formatted
      });
    });
  } catch (e) {
    console.error("Exception in getAllBalances:", e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const IdentityService = require("../services/IdentityService");
    const authIdentifier = (req.user && (req.user.email || req.user.userId || req.user.id || req.user.employeeId || req.user.employee_id)) || (req.headers && req.headers['x-employee-id']) || 1;
    const identity = await IdentityService.resolveUser(authIdentifier);

    const userRole = (identity?.role || req.user?.role || req.headers['x-user-role'] || 'EMPLOYEE').toUpperCase().replace(/[\s_-]+/g, '');
    const currentEmpId = identity?.employeeId || req.user?.employeeId || req.user?.employee_id;
    const currentTeamId = identity?.teamId;

    const { employee_id } = req.query;
    let sql = `
      SELECT la.*, e.name as employee_name, lt.name as leave_name, lt.code as leave_code
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      JOIN leave_types lt ON la.leave_type_id = lt.id
    `;
    const whereParts = [];
    const params = [];

    if (employee_id) {
      whereParts.push("la.employee_id = ?");
      params.push(employee_id);
    } else if (['SUPERADMIN', 'ADMIN', 'HR', 'HRMANAGER', 'HRADMIN', 'BRANCHMANAGER'].includes(userRole)) {
      // Full view
    } else if (['TEAMLEADER', 'TEAMLEAD', 'LEAD'].includes(userRole)) {
      whereParts.push(`(
        (e.team_id IS NOT NULL AND e.team_id = ?) 
        OR e.id = ? 
        OR e.team_id IN (SELECT id FROM teams WHERE team_lead_id = ?)
      )`);
      params.push(currentTeamId || 0, currentEmpId || 0, currentEmpId || 0);
    } else {
      whereParts.push("la.employee_id = ?");
      params.push(currentEmpId || 0);
    }

    if (whereParts.length > 0) {
      sql += " WHERE " + whereParts.join(" AND ");
    }
    sql += " ORDER BY la.applied_on DESC";

    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    });
  } catch (err) {
    console.error("Error in getApplications:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
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
    const leaveId = result.insertId;

    // Trigger Notification
    db.query("SELECT name FROM leave_types WHERE code = ?", [leave_type_code], (errType, typeRows) => {
      const leaveTypeName = typeRows && typeRows.length > 0 ? typeRows[0].name : leave_type_code;
      const NotificationService = require("../services/NotificationService");
      NotificationService.triggerLeaveRequest(leaveId, employee_id, leaveTypeName, start_date, end_date)
        .catch(e => console.error("Error triggering leave request notification:", e));
    });

    res.json({ message: "Leave application submitted successfully", id: leaveId });
  });
};

exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status, approved_by } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const fetchSql = `
    SELECT la.*, lt.name as leave_name 
    FROM leave_applications la 
    JOIN leave_types lt ON la.leave_type_id = lt.id 
    WHERE la.id = ?
  `;
  db.query(fetchSql, [id], (errFetch, fetchRows) => {
    const app = fetchRows && fetchRows.length > 0 ? fetchRows[0] : null;
    const sql = "UPDATE leave_applications SET status = ?, approved_by = ? WHERE id = ?";
    db.query(sql, [status, approved_by, id], (err) => {
      if (err) return res.status(500).json(err);

      if (app) {
        const NotificationService = require("../services/NotificationService");
        const startStr = new Date(app.start_date).toISOString().split('T')[0];
        const endStr = new Date(app.end_date).toISOString().split('T')[0];
        NotificationService.triggerLeaveStatusUpdate(id, app.employee_id, app.leave_name, status, startStr, endStr)
          .catch(e => console.error("Error triggering leave status update notification:", e));
      }

      res.json({ message: "Leave application updated successfully" });
    });
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

exports.getCompOffRequests = (req, res) => {
  const sql = `
    SELECT 
      co.*,
      COALESCE(e.name, co.employee_name) as employee_name,
      e.profile_photo as avatar,
      COALESCE(d.dept_name, 'General') as dept
    FROM comp_off_requests co
    LEFT JOIN employees e ON co.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY co.id DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.submitCompOffRequest = (req, res) => {
  const { employee_id, worked_date, earned_date, expiry_date, total_days, reason, status } = req.body;
  const sql = `
    INSERT INTO comp_off_requests (employee_id, employee_name, worked_date, earned_date, expiry_date, overtime_hours, earned_days, reason, status, approved_by, created_at)
    VALUES (?, (SELECT name FROM employees WHERE id = ?), ?, ?, ?, '8h 00m', ?, ?, ?, '-', NOW())
  `;
  const daysStr = `${total_days || 1} Day${(parseFloat(total_days) || 1) > 1 ? 's' : ''}`;
  db.query(sql, [employee_id || 1, employee_id || 1, worked_date || 'Today', earned_date || 'Today', expiry_date || '90 Days', daysStr, reason || 'Comp off request', status || 'Pending'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Comp off request created successfully", id: result.insertId });
  });
};

exports.updateCompOffStatus = (req, res) => {
  const { id } = req.params;
  const { status, approved_by } = req.body;
  const sql = "UPDATE comp_off_requests SET status = ?, approved_by = ? WHERE id = ?";
  db.query(sql, [status, approved_by || 'Management', id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Comp off status updated successfully" });
  });
};
