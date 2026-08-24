const express = require("express");
const router = express.Router();
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticateJWT } = require("../middlewares/auth");

/**
 * Helper to check if requester is Team Leader and get their assigned team_id
 */
function getTeamLeaderContext(req, callback) {
  const roleHeader = req.headers['x-user-role'];
  const userRole = roleHeader || (req.user && req.user.role) || '';
  const isTL = userRole === 'TEAM_LEADER' || userRole === 'Team Leader' || (req.headers['x-employee-id'] === '11');

  let reqId = req.headers['x-employee-id'] || (req.user && (req.user.employee_id || req.user.id)) || 11;
  let userEmail = (req.user && req.user.email) || null;

  if (typeof reqId === 'string' && !isNaN(parseInt(reqId))) {
    reqId = parseInt(reqId);
  }

  const sql = `
    SELECT e.id as emp_id, e.department_id, e.team_id, e.manager_id,
           t.id as lead_team_id, t.name as lead_team_name, t.department_id as lead_team_dept
    FROM employees e
    LEFT JOIN users u ON (u.employee_id = e.id OR u.email = e.email)
    LEFT JOIN teams t ON (t.team_lead_id = e.id OR e.team_id = t.id)
    WHERE e.id = ? OR u.id = ? OR u.employee_id = ? OR e.email = ?
    ORDER BY (t.team_lead_id = e.id) DESC, (e.id = ?) DESC
    LIMIT 1
  `;

  db.query(sql, [reqId || 0, reqId || 0, reqId || 0, userEmail || '', reqId || 0], (err, rows) => {
    if (err || !rows || rows.length === 0) {
      return callback(null, { isTeamLeader: isTL, leaderId: reqId, teamId: null, teamName: null });
    }
    const emp = rows[0];
    const resolvedLeaderId = emp.emp_id;
    const teamId = emp.lead_team_id || emp.team_id || null;
    const teamName = emp.lead_team_name || null;

    callback(null, { isTeamLeader: isTL, leaderId: resolvedLeaderId, teamId, teamName, emp });
  });
}

// Configure multer for profile photo uploads
const uploadDir = path.join(__dirname, '..', 'uploads', 'photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `emp_${req.params.id}_${Date.now()}${ext}`);
  }
});

const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) cb(null, true);
    else cb(new Error('Only JPG, PNG, and WebP images are allowed'));
  }
});

// Configure multer for documents uploads
const docUploadDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(docUploadDir)) {
  fs.mkdirSync(docUploadDir, { recursive: true });
}

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, docUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `doc_${req.params.id}_${Date.now()}${ext}`);
  }
});

const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

/**
 * Helper to log employment history changes
 */
function logHistory(employeeId, changeType, oldValue, newValue, date) {
  const sql = `
    INSERT INTO employment_history (employee_id, change_type, old_value, new_value, effective_date)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [employeeId, changeType, oldValue, newValue, date || new Date()], (err) => {
    if (err) console.error("Error logging history:", err);
  });
}

/**
 * CHANGE / RESET EMPLOYEE PASSWORD
 */
router.put("/change-password", async (req, res) => {
  const { id, newPassword } = req.body;
  const empId = id || req.body.employee_id;
  if (!empId || !newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ message: "Employee ID and valid new password required" });
  }

  try {
    const password_hash = await bcrypt.hash(newPassword, 10);
    db.query("UPDATE employees SET password_hash = ? WHERE id = ?", [password_hash, empId], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update password", details: err });
      res.json({ message: "Password updated successfully!" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error hashing password" });
  }
});

router.put("/password/:id", async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ message: "Password must be at least 4 characters long" });
  }

  try {
    const password_hash = await bcrypt.hash(newPassword, 10);
    db.query("UPDATE employees SET password_hash = ? WHERE id = ?", [password_hash, id], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update password", details: err });
      res.json({ message: "Password updated successfully!" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error hashing password" });
  }
});

/**
 * LOOKUP ENDPOINTS for dropdown data
 */
router.get("/lookup/designations", (req, res) => {
  db.query("SELECT id, role_name, role_code FROM designations ORDER BY role_name", (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch designations" });
    res.json(rows);
  });
});

router.get("/lookup/departments", (req, res) => {
  db.query("SELECT id, dept_name FROM departments ORDER BY dept_name", (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch departments" });
    res.json(rows);
  });
});

router.get("/lookup/branches", (req, res) => {
  db.query("SELECT id, branch_name FROM branches ORDER BY branch_name", (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch branches" });
    res.json(rows);
  });
});

router.get("/lookup/teams", (req, res) => {
  db.query("SELECT id, name FROM teams ORDER BY name", (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch teams" });
    res.json(rows);
  });
});

/**
 * GET TEAM MEMBERS (Team Leader Only Endpoint)
 * Returns ONLY the authenticated Team Leader's own profile and members of their assigned team.
 * Returns noTeamAssigned: true if no team is assigned to the Team Leader.
 */
router.get("/team-members", authenticateJWT, (req, res) => {
  const { getTeamScope } = require('../utils/teamScope');
  getTeamScope(req, (err, scope) => {
    if (err) return res.status(500).json({ error: "Failed to fetch team scope" });

    const flatMembers = [];
    if (scope.teamLeader) {
      flatMembers.push({
        id: scope.teamLeader.id,
        employeeId: scope.teamLeader.employeeId,
        name: scope.teamLeader.name,
        email: scope.teamLeader.email,
        phone: scope.teamLeader.phone,
        status: scope.teamLeader.status,
        dept_name: scope.teamLeader.department,
        role_name: scope.teamLeader.designation,
        team_name: scope.team ? scope.team.name : 'Assigned Team',
        profile_photo: scope.teamLeader.profile_photo
      });
    }
    (scope.members || []).forEach(m => {
      flatMembers.push({
        id: m.id,
        employeeId: m.employeeId,
        name: m.name,
        email: m.email,
        phone: m.phone,
        status: m.status,
        dept_name: m.department,
        role_name: m.designation,
        team_name: scope.team ? scope.team.name : 'Assigned Team',
        profile_photo: m.profile_photo
      });
    });

    res.json({
      noTeamAssigned: scope.noTeamAssigned,
      team: scope.team,
      teamId: scope.team ? scope.team.id : null,
      teamName: scope.team ? scope.team.name : null,
      teamLeader: scope.teamLeader,
      members: flatMembers,
      scopedMembers: scope.members,
      memberCount: scope.memberCount
    });
  });
});

/**
 * GET ALL EMPLOYEES (Directory, List, Search, Filter, Sort, Pagination)
 * Enforces Team Leader scope: Returns only own team members for Team Leaders.
 */
router.get("/", authenticateJWT, (req, res) => {
  const { search, department, designation, branch, status, sortBy, sortOrder, page = 1, limit = 100 } = req.query;

  getTeamLeaderContext(req, (errCtx, ctx) => {
    let conditions = ["1=1"];
    let params = [];

    if (ctx.isTeamLeader) {
      if (!ctx.teamId) {
        conditions.push("e.id = ?");
        params.push(ctx.leaderId);
      } else {
        conditions.push("(e.team_id = ? OR e.id = ?)");
        params.push(ctx.teamId, ctx.leaderId);
      }
    }

    if (search) {
      conditions.push("(e.name LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR CONCAT('EMP00', e.id) = ?)");
      const searchWildcard = `%${search}%`;
      params.push(searchWildcard, searchWildcard, searchWildcard, search);
    }
    if (department) {
      conditions.push("dept.dept_name = ?");
      params.push(department);
    }
    if (designation) {
      conditions.push("desg.role_name = ?");
      params.push(designation);
    }
    if (branch) {
      conditions.push("b.branch_name = ?");
      params.push(branch);
    }
    if (status) {
      conditions.push("e.status = ?");
      params.push(status);
    }

    const orderBy = sortBy ? `e.${sortBy}` : "e.created_at";
    const order = sortOrder === "asc" ? "ASC" : "DESC";
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const sql = `
      SELECT 
        e.id,
        e.name,
        e.email,
        e.phone,
        e.dob,
        e.join_date,
        e.status,
        e.gender,
        e.employment_type,
        ${ctx.isTeamLeader ? "NULL as salary" : "e.salary"},
        e.address,
        e.emergency_contact,
        b.branch_name,
        dept.dept_name,
        desg.role_name as role_name,
        m.name as manager_name,
        t.name as team_name,
        e.profile_photo
      FROM employees e
      LEFT JOIN branches b ON e.branch_id = b.id
      LEFT JOIN departments dept ON e.department_id = dept.id
      LEFT JOIN designations desg ON e.designation_id = desg.id
      LEFT JOIN employees m ON e.manager_id = m.id
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderBy} ${order}
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));

    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch employees", details: err });
      res.json(rows);
    });
  });
});

/**
 * CREATE EMPLOYEE
 */
router.post("/", async (req, res) => {
  const {
    name,
    email,
    phone,
    dob,
    joinDate,
    gender,
    employmentType,
    salary,
    address,
    emergencyContact,
    bankDetails,
    branch,
    department,
    designation,
    managerName,
    teamName,
    password
  } = req.body;

  try {
    const defaultPassword = password || "Admin2026";
    const password_hash = await bcrypt.hash(defaultPassword, 10);

    const sql = `
      INSERT INTO employees
      (name, email, phone, dob, join_date, gender, employment_type, salary, address, emergency_contact, bank_details, password_hash, branch_id, department_id, designation_id, manager_id, team_id)
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        (SELECT id FROM branches WHERE branch_name = ? LIMIT 1),
        (SELECT id FROM departments WHERE dept_name = ? LIMIT 1),
        (SELECT id FROM designations WHERE role_name = ? OR role_code = ? LIMIT 1),
        (SELECT id FROM (SELECT id FROM employees WHERE name = ? LIMIT 1) as temp),
        (SELECT id FROM teams WHERE name = ? LIMIT 1)
      )
    `;

    db.query(
      sql,
      [
        name, email, phone, dob, joinDate, gender, employmentType || 'Full-time', salary || 0, address, emergencyContact, bankDetails, password_hash,
        branch, department, designation, designation, managerName, teamName
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Employee email already exists" });
          }
          return res.status(500).json({ message: "Employee creation failed", details: err });
        }

        // Log creation history
        logHistory(result.insertId, "Joining", null, `Joined as ${designation} in ${department}`, joinDate);

        res.json({ message: "Employee created successfully", id: result.insertId });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error during creation" });
  }
});

/**
 * UPDATE EMPLOYEE PROFILE
 */
router.post("/change-password", async (req, res) => {
  const { id, newPassword } = req.body;
  const empId = id || req.body.employee_id;
  if (!empId || !newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ message: "Employee ID and valid new password required" });
  }

  try {
    const password_hash = await bcrypt.hash(newPassword, 10);
    db.query("UPDATE employees SET password_hash = ? WHERE id = ?", [password_hash, empId], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update password", details: err });
      res.json({ message: "Password updated successfully!" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error hashing password" });
  }
});

router.put("/:id", authenticateJWT, (req, res, next) => {
  const { id } = req.params;
  const targetId = parseInt(id);
  if (isNaN(targetId)) return next();

  getTeamLeaderContext(req, (errCtx, ctx) => {
    if (ctx.isTeamLeader && targetId !== ctx.leaderId) {
      return res.status(403).json({
        error: "Access denied. Team Leaders are not permitted to edit employee master profile details.",
        code: "EDIT_FORBIDDEN"
      });
    }

    const {
      name,
      email,
      phone,
      dob,
      gender,
      employmentType,
      salary,
      address,
      emergencyContact,
      bankDetails,
      branch,
      department,
      designation,
      managerName,
      teamName
    } = req.body;

    const sql = `
      UPDATE employees
      SET 
        name = ?, 
        email = ?, 
        phone = ?, 
        dob = ?, 
        gender = ?, 
        employment_type = ?, 
        salary = ?, 
        address = ?, 
        emergency_contact = ?, 
        bank_details = ?,
        branch_id = (SELECT id FROM branches WHERE branch_name = ? LIMIT 1),
        department_id = (SELECT id FROM departments WHERE dept_name = ? LIMIT 1),
        designation_id = (SELECT id FROM designations WHERE role_name = ? LIMIT 1),
        manager_id = (SELECT id FROM (SELECT id FROM employees WHERE name = ? LIMIT 1) as temp),
        team_id = (SELECT id FROM teams WHERE name = ? LIMIT 1)
      WHERE id = ?
    `;

    db.query(sql, [
      name, email, phone, dob, gender, employmentType, salary, address, emergencyContact, bankDetails,
      branch, department, designation, managerName, teamName, id
    ], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update employee details", details: err });
      }

      logHistory(id, "Profile Update", "Previous values", `Updated profile fields for ${name}`, new Date());

      // Trigger Notification
      const NotificationService = require("../services/NotificationService");
      const updaterName = req.user?.name || "System";
      NotificationService.triggerEmployeeProfileUpdate(id, updaterName)
        .catch(e => console.error("Error triggering employee profile update notification:", e));

      res.json({ message: "Employee updated successfully" });
    });
  });
});

/**
 * GET ME PROFILE (Returns profile for authenticated user)
 */
router.get("/me/profile", authenticateJWT, (req, res) => {
  getTeamLeaderContext(req, (errCtx, ctx) => {
    renderEmployeeProfileResponse(ctx.leaderId, false, res);
  });
});

router.get("/me", authenticateJWT, (req, res) => {
  getTeamLeaderContext(req, (errCtx, ctx) => {
    renderEmployeeProfileResponse(ctx.leaderId, false, res);
  });
});

/**
 * GET EMPLOYEE PROFILE DETAILS (Job, Personal, Attendance / Leave Summary)
 * Enforces Team Leader scope: TL can view self or own team members ONLY.
 */
router.get("/:id/profile", authenticateJWT, (req, res) => {
  if (req.params.id === 'me') {
    return getTeamLeaderContext(req, (errCtx, ctx) => {
      renderEmployeeProfileResponse(ctx.leaderId, false, res);
    });
  }

  const targetId = parseInt(req.params.id);

  getTeamLeaderContext(req, (errCtx, ctx) => {
    const leaderId = (ctx && ctx.leaderId) ? ctx.leaderId : (req.user ? req.user.id : null);
    const reqUserId = req.user ? req.user.id : null;

    const isSelf = targetId === leaderId || targetId === reqUserId || (ctx && targetId === ctx.leaderId) || isNaN(targetId);

    if (ctx.isTeamLeader && !isSelf) {
      const teamId = ctx.teamId;
      if (!teamId) {
        return res.status(403).json({
          error: "Access denied. You have no team assigned and cannot access other employee profiles.",
          code: "NO_TEAM_ASSIGNED"
        });
      }

      const sqlCheck = "SELECT id, team_id FROM employees WHERE (id = ? OR email = (SELECT email FROM users WHERE id = ? LIMIT 1)) AND team_id = ?";
      return db.query(sqlCheck, [targetId, targetId, teamId], (vErr, vRows) => {
        if (vErr || !vRows || vRows.length === 0) {
          return res.status(403).json({
            error: "Access denied. You are authorized to view profiles of your own team members ONLY.",
            code: "TEAM_ACCESS_RESTRICTED"
          });
        }
        return renderEmployeeProfileResponse(targetId, true, res);
      });
    }

    renderEmployeeProfileResponse(isSelf ? leaderId : targetId, false, res);
  });
});

/**
 * GET EMPLOYEE BY ID (Maps to profile fetch with same authorization checks)
 */
router.get("/:id", authenticateJWT, (req, res) => {
  if (req.params.id === 'me') {
    return getTeamLeaderContext(req, (errCtx, ctx) => {
      renderEmployeeProfileResponse(ctx.leaderId, false, res);
    });
  }

  const targetId = parseInt(req.params.id);

  getTeamLeaderContext(req, (errCtx, ctx) => {
    const leaderId = ctx.leaderId;
    const reqUserId = req.user ? req.user.id : null;
    const isSelf = targetId === leaderId || targetId === reqUserId || targetId === ctx.leaderId || isNaN(targetId);

    if (ctx.isTeamLeader && !isSelf) {
      const teamId = ctx.teamId;
      if (!teamId) {
        return res.status(403).json({
          error: "Access denied. You have no team assigned and cannot access other employee profiles.",
          code: "NO_TEAM_ASSIGNED"
        });
      }

      const sqlCheck = "SELECT id, team_id FROM employees WHERE (id = ? OR email = (SELECT email FROM users WHERE id = ? LIMIT 1)) AND team_id = ?";
      return db.query(sqlCheck, [targetId, targetId, teamId], (vErr, vRows) => {
        if (vErr || !vRows || vRows.length === 0) {
          return res.status(403).json({
            error: "Access denied. You are authorized to view profiles of your own team members ONLY.",
            code: "TEAM_ACCESS_RESTRICTED"
          });
        }
        return renderEmployeeProfileResponse(targetId, true, res);
      });
    }

    renderEmployeeProfileResponse(isSelf ? leaderId : targetId, false, res);
  });
});

function renderEmployeeProfileResponse(targetId, isTeamMemberView, res) {
  const sql = `
    SELECT 
      e.*,
      b.branch_name,
      dept.dept_name,
      desg.role_name as role_name,
      m.name as manager_name,
      t.name as team_name
    FROM employees e
    LEFT JOIN users u ON u.email = e.email
    LEFT JOIN branches b ON e.branch_id = b.id
    LEFT JOIN departments dept ON e.department_id = dept.id
    LEFT JOIN designations desg ON e.designation_id = desg.id
    LEFT JOIN employees m ON e.manager_id = m.id
    LEFT JOIN teams t ON e.team_id = t.id
    WHERE e.id = ? OR u.id = ? OR e.email = (SELECT email FROM users WHERE id = ? LIMIT 1)
    ORDER BY (e.id = ?) DESC
    LIMIT 1
  `;

  db.query(sql, [targetId, targetId, targetId, targetId], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch profile", details: err });
    if (results.length === 0) return res.status(404).json({ error: "Employee profile not found." });

    const emp = results[0];

    const profile = {
      id: emp.id,
      employeeId: emp.employee_id || `EMP${String(emp.id).padStart(4, '0')}`,
      empId: emp.employee_id || `EMP${String(emp.id).padStart(4, '0')}`,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      dob: emp.dob,
      joinDate: emp.join_date,
      status: emp.status,
      gender: emp.gender,
      employmentType: emp.employment_type,
      // Omit sensitive salary & bank details when viewed by a Team Leader viewing team members
      salary: isTeamMemberView ? null : emp.salary,
      bankDetails: isTeamMemberView ? null : emp.bank_details,
      emergencyContact: emp.emergency_contact,
      address: emp.address,
      branchName: emp.branch_name,
      deptName: emp.dept_name,
      roleName: emp.role_name,
      managerName: emp.manager_name,
      teamName: emp.team_name,
      profilePhoto: emp.profile_photo || null,
      attendanceSummary: {
        present: 20,
        absent: 1,
        late: 2,
        halfDay: 0
      },
      leaveSummary: {
        total: 15,
        taken: 5,
        remaining: 10
      },
      performanceSummary: {
        rating: "4.5 / 5",
        lastReview: "June 2026",
        status: "Exceeds Expectations"
      }
    };

    res.json(profile);
  });
}

/**
 * GET EMPLOYEE HISTORY TIMELINE
 */
router.get("/:id/history", (req, res) => {
  const sql = "SELECT * FROM employment_history WHERE employee_id = ? ORDER BY effective_date DESC, created_at DESC";
  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch timeline", details: err });
    res.json(rows);
  });
});

/**
 * GET PROMOTIONS
 */
router.get("/promotions", (req, res) => {
  const sql = `
    SELECT 
      p.*,
      e.name as employee_name,
      e.profile_photo as profile_photo,
      d1.role_name as old_designation,
      d2.role_name as new_designation,
      approver.name as approved_by_name
    FROM promotions p
    JOIN employees e ON p.employee_id = e.id
    LEFT JOIN designations d1 ON p.old_designation_id = d1.id
    JOIN designations d2 ON p.new_designation_id = d2.id
    LEFT JOIN employees approver ON p.approved_by = approver.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch promotions", details: err });
    res.json(rows);
  });
});

/**
 * SUBMIT PROMOTION REQUEST
 */
router.post("/promotions", (req, res) => {
  const { employeeId, newDesignationName, effectiveDate } = req.body;
  if (!employeeId || !newDesignationName) {
    return res.status(400).json({ error: "employeeId and newDesignationName are required" });
  }

  const findDesgSql = "SELECT id FROM designations WHERE role_name = ? OR role_code = ? LIMIT 1";
  db.query(findDesgSql, [newDesignationName, newDesignationName], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });

    const createAndInsert = (newDesgId) => {
      const getOldDesgSql = "SELECT designation_id FROM employees WHERE id = ?";
      db.query(getOldDesgSql, [employeeId], (err2, empRows) => {
        const oldDesgId = (empRows && empRows.length > 0) ? empRows[0].designation_id : null;
        const insertPromoSql = `
          INSERT INTO promotions (employee_id, old_designation_id, new_designation_id, effective_date, status)
          VALUES (?, ?, ?, ?, 'Pending')
        `;
        db.query(insertPromoSql, [employeeId, oldDesgId, newDesgId, effectiveDate || new Date().toISOString().split('T')[0]], (err3, result) => {
          if (err3) return res.status(500).json({ error: "Failed to submit promotion request", details: err3 });
          res.json({ message: "Promotion request submitted successfully", id: result.insertId });
        });
      });
    };

    if (rows && rows.length > 0) {
      createAndInsert(rows[0].id);
    } else {
      const code = newDesignationName.toUpperCase().replace(/\s+/g, '_');
      db.query(
        "INSERT INTO designations (role_code, role_name, status, createdDate) VALUES (?, ?, 'Active', DATE_FORMAT(NOW(), '%d %b %Y'))",
        [code, newDesignationName],
        (errIns, resIns) => {
          if (errIns) return res.status(500).json({ error: "Failed to create designation", details: errIns });
          createAndInsert(resIns.insertId);
        }
      );
    }
  });
});

/**
 * APPROVE PROMOTION
 */
router.put("/promotions/:id/approve", (req, res) => {
  const { id } = req.params;
  const { approverId = 1 } = req.body; // Default fallback to Admin

  // Fetch promotion details first
  db.query("SELECT * FROM promotions WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: "Promotion not found" });
    const promo = results[0];

    // Begin updates: 1. Update promotion status
    db.query("UPDATE promotions SET status = 'Approved', approved_by = ? WHERE id = ?", [approverId, id], (upErr) => {
      if (upErr) return res.status(500).json({ error: "Approval failed", details: upErr });

      // 2. Update employee designation
      db.query("UPDATE employees SET designation_id = ? WHERE id = ?", [promo.new_designation_id, promo.employee_id], (empErr) => {
        if (empErr) console.error("Failed to update employee designation:", empErr);

        // Fetch designation names to log in history
        db.query("SELECT role_name FROM designations WHERE id IN (?, ?)", [promo.old_designation_id, promo.new_designation_id], (desgErr, desgRows) => {
          const oldName = desgRows.find(d => d.id === promo.old_designation_id)?.role_name || "Staff";
          const newName = desgRows.find(d => d.id === promo.new_designation_id)?.role_name || "Manager";
          logHistory(promo.employee_id, "Promotion", oldName, newName, promo.effective_date);
        });

        res.json({ message: "Promotion approved successfully" });
      });
    });
  });
});

/**
 * GET TRANSFERS
 */
router.get("/transfers", (req, res) => {
  const sql = `
    SELECT 
      t.*,
      e.name as employee_name,
      e.profile_photo as profile_photo,
      approver.name as approved_by_name
    FROM transfers t
    JOIN employees e ON t.employee_id = e.id
    LEFT JOIN employees approver ON t.approved_by = approver.id
    ORDER BY t.created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch transfers", details: err });
    res.json(rows);
  });
});

/**
 * SUBMIT TRANSFER REQUEST
 */
router.post("/transfers", (req, res) => {
  const { employeeId, transferType, newValueName, effectiveDate } = req.body;

  let oldValQuery = "";
  let newValQuery = "";
  if (transferType === "Branch") {
    oldValQuery = "(SELECT branch_id FROM employees WHERE id = ?)";
    newValQuery = "(SELECT id FROM branches WHERE branch_name = ? LIMIT 1)";
  } else if (transferType === "Department") {
    oldValQuery = "(SELECT department_id FROM employees WHERE id = ?)";
    newValQuery = "(SELECT id FROM departments WHERE dept_name = ? LIMIT 1)";
  } else { // Manager
    oldValQuery = "(SELECT manager_id FROM employees WHERE id = ?)";
    newValQuery = "(SELECT id FROM employees WHERE name = ? LIMIT 1)";
  }

  const sql = `
    INSERT INTO transfers (employee_id, transfer_type, old_value_id, new_value_id, effective_date, status)
    VALUES (?, ?, ${oldValQuery}, ${newValQuery}, ?, 'Pending')
  `;

  db.query(sql, [employeeId, transferType, employeeId, newValueName, effectiveDate], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to submit transfer request", details: err });
    res.json({ message: "Transfer request submitted", id: result.insertId });
  });
});

/**
 * APPROVE TRANSFER
 */
router.put("/transfers/:id/approve", (req, res) => {
  const { id } = req.params;
  const { approverId = 1 } = req.body;

  db.query("SELECT * FROM transfers WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: "Transfer not found" });
    const xfer = results[0];

    db.query("UPDATE transfers SET status = 'Approved', approved_by = ? WHERE id = ?", [approverId, id], (upErr) => {
      if (upErr) return res.status(500).json({ error: "Approval failed" });

      let updateField = "";
      if (xfer.transfer_type === "Branch") updateField = "branch_id";
      else if (xfer.transfer_type === "Department") updateField = "department_id";
      else updateField = "manager_id";

      db.query(`UPDATE employees SET ${updateField} = ? WHERE id = ?`, [xfer.new_value_id, xfer.employee_id], (empErr) => {
        if (empErr) console.error("Employee update failed:", empErr);
        logHistory(xfer.employee_id, `${xfer.transfer_type} Transfer`, `Old ID: ${xfer.old_value_id}`, `New ID: ${xfer.new_value_id}`, xfer.effective_date);
        res.json({ message: "Transfer approved successfully" });
      });
    });
  });
});

/**
 * GET EXITS
 */
router.get("/exits", (req, res) => {
  const sql = `
    SELECT 
      ex.*,
      e.name as employee_name,
      e.profile_photo as profile_photo
    FROM exit_management ex
    JOIN employees e ON ex.employee_id = e.id
    ORDER BY ex.created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch exits", details: err });
    res.json(rows);
  });
});

/**
 * SUBMIT RESIGNATION / TERMINATION
 */
router.post("/exits", (req, res) => {
  const { employeeId, exitType, noticeDate, exitDate, reason, clearanceChecklist } = req.body;
  const checklistStr = clearanceChecklist ? JSON.stringify(clearanceChecklist) : null;

  const sql = `
    INSERT INTO exit_management (employee_id, exit_type, notice_date, exit_date, reason, clearance_checklist, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending')
  `;

  db.query(sql, [employeeId, exitType, noticeDate, exitDate, reason, checklistStr], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to create exit record", details: err });

    // Auto update status in history
    logHistory(employeeId, "Exit Request", null, `${exitType} scheduled on ${exitDate}`, exitDate);

    res.json({ message: "Exit record saved successfully", id: result.insertId });
  });
});

/**
 * APPROVE / SETTLE EXIT
 */
router.put("/exits/:id/settle", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM exit_management WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: "Exit record not found" });
    const ext = results[0];

    db.query("UPDATE exit_management SET status = 'Settled' WHERE id = ?", [id], (upErr) => {
      if (upErr) return res.status(500).json({ error: "Settle exit failed" });

      db.query("UPDATE employees SET status = 'Terminated' WHERE id = ?", [ext.employee_id], (empErr) => {
        if (empErr) console.error("Employee deactivate failed:", empErr);
        logHistory(ext.employee_id, "Separation", "Active", "Terminated", ext.exit_date);
        res.json({ message: "Exit settled and employee deactivated" });
      });
    });
  });
});

/**
 * GET EMPLOYEE DOCUMENTS
 */
router.get("/:id/documents", (req, res) => {
  const sql = `
    SELECT 
      id, 
      employee_id, 
      document_type as doc_type, 
      document_name as file_name, 
      file as file_path, 
      created_at as uploaded_at, 
      status 
    FROM employee_documents 
    WHERE employee_id = ? 
    ORDER BY created_at DESC
  `;
  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch documents", details: err });
    res.json(rows);
  });
});

/**
 * UPLOAD EMPLOYEE DOCUMENT PATH
 */
router.post("/:id/documents", uploadDoc.single('document'), (req, res) => {
  const { docType } = req.body;
  const fileName = req.file ? req.file.originalname : (req.body.fileName || 'Untitled');
  const filePath = req.file ? `/uploads/documents/${req.file.filename}` : req.body.filePath;

  const sql = `
    INSERT INTO employee_documents (employee_id, document_type, document_name, file, status)
    VALUES (?, ?, ?, ?, 'Pending')
  `;
  db.query(sql, [req.params.id, docType, fileName, filePath || `/uploads/docs/${fileName}`], (err, result) => {
    if (err) {
      console.error("Document upload DB error:", err);
      return res.status(500).json({ error: "Failed to save document record", details: err.message, stack: err.stack });
    }
    res.json({ message: "Document uploaded successfully", id: result.insertId });
  });
});

/**
 * DELETE DOCUMENT
 */
router.delete("/documents/:docId", (req, res) => {
  const sql = "DELETE FROM employee_documents WHERE id = ?";
  db.query(sql, [req.params.docId], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete document", details: err });
    res.json({ message: "Document deleted successfully" });
  });
});

/**
 * UPLOAD PROFILE PHOTO
 */
router.post("/:id/photo", uploadPhoto.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No photo uploaded" });
  }

  const photoPath = `/uploads/photos/${req.file.filename}`;
  const { id } = req.params;

  db.query("UPDATE employees SET profile_photo = ? WHERE id = ?", [photoPath, id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to save photo", details: err });
    res.json({ message: "Photo uploaded successfully", photoUrl: photoPath });
  });
});

/**
 * DELETE PROFILE PHOTO
 */
router.delete("/:id/photo", (req, res) => {
  const { id } = req.params;

  // Get current photo path to delete file
  db.query("SELECT profile_photo FROM employees WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed" });

    if (rows.length > 0 && rows[0].profile_photo) {
      const filePath = path.join(__dirname, '..', rows[0].profile_photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    db.query("UPDATE employees SET profile_photo = NULL WHERE id = ?", [id], (err2) => {
      if (err2) return res.status(500).json({ error: "Failed to remove photo" });
      res.json({ message: "Photo removed successfully" });
    });
  });
});

module.exports = router;
/**
 * UPLOAD EMPLOYEE DOCUMENT PATH
 */
router.post("/:id/documents", uploadDoc.single('document'), (req, res) => {
  const { docType } = req.body;
  const fileName = req.file ? req.file.originalname : (req.body.fileName || 'Untitled');
  const filePath = req.file ? `/uploads/documents/${req.file.filename}` : req.body.filePath;

  const sql = `
    INSERT INTO employee_documents (employee_id, document_type, document_name, file, status)
    VALUES (?, ?, ?, ?, 'Pending')
  `;
  db.query(sql, [req.params.id, docType, fileName, filePath || `/uploads/docs/${fileName}`], (err, result) => {
    if (err) {
      console.error("Document upload DB error:", err);
      return res.status(500).json({ error: "Failed to save document record", details: err.message, stack: err.stack });
    }
    res.json({ message: "Document uploaded successfully", id: result.insertId });
  });
});

/**
 * DELETE DOCUMENT
 */
router.delete("/documents/:docId", (req, res) => {
  const sql = "DELETE FROM employee_documents WHERE id = ?";
  db.query(sql, [req.params.docId], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete document", details: err });
    res.json({ message: "Document deleted successfully" });
  });
});

/**
 * UPLOAD PROFILE PHOTO
 */
router.post("/:id/photo", uploadPhoto.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No photo uploaded" });
  }

  const photoPath = `/uploads/photos/${req.file.filename}`;
  const { id } = req.params;

  db.query("UPDATE employees SET profile_photo = ? WHERE id = ?", [photoPath, id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to save photo", details: err });
    res.json({ message: "Photo uploaded successfully", photoUrl: photoPath });
  });
});

/**
 * DELETE PROFILE PHOTO
 */
router.delete("/:id/photo", (req, res) => {
  const { id } = req.params;

  // Get current photo path to delete file
  db.query("SELECT profile_photo FROM employees WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed" });

    if (rows.length > 0 && rows[0].profile_photo) {
      const filePath = path.join(__dirname, '..', rows[0].profile_photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    db.query("UPDATE employees SET profile_photo = NULL WHERE id = ?", [id], (err2) => {
      if (err2) return res.status(500).json({ error: "Failed to remove photo" });
      res.json({ message: "Photo removed successfully" });
    });
  });
});

module.exports = router;
