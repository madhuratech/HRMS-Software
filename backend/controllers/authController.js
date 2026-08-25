const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET || "madhura_super_secret_key_2026";

/**
 * Helper to identify the actual role from designation name or role name
 */
function getEmployeeRole(employee) {
  const desgLower = (employee.designation_name || '').toLowerCase();
  const roleLower = (employee.role_name || '').toLowerCase();
  const emailLower = (employee.email || '').toLowerCase();

  if (roleLower.includes('admin') || emailLower.includes('admin')) {
    return 'SUPER_ADMIN';
  } else if (desgLower.includes('team leader') || desgLower.includes('team lead') || roleLower.includes('team leader') || employee.id === 19 || employee.id === 11) {
    return 'TEAM_LEADER';
  } else if (desgLower.includes('hr') || desgLower.includes('manager') || roleLower.includes('manager') || roleLower.includes('branch_manager') || roleLower.includes('hr_manager') || employee.id === 2 || employee.id === 20) {
    return 'BRANCH_MANAGER';
  }
  return 'EMPLOYEE';
}

exports.login = (req, res) => {
  const { email, password, loginType } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Query users table for authentication
  const sql = `
    SELECT u.*, e.id as emp_db_id, e.name as emp_name 
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE LOWER(u.email) = LOWER(?)
  `;

  db.query(sql, [cleanEmail], async (err, results) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).json({ success: false, message: "Database query error" });
    }

    let user = results[0];
    let isMatch = false;

    if (user && user.password_hash) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }

    // Fallback: If not matched in users table, check employees table
    if (!isMatch) {
      const empCheckSql = `
        SELECT e.*, r.name as role_name, desg.role_name as designation_name
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN designations desg ON e.designation_id = desg.id
        WHERE LOWER(e.email) = LOWER(?) AND e.password_hash IS NOT NULL
      `;
      const empResults = await new Promise((resolve) => {
        db.query(empCheckSql, [cleanEmail], (eErr, eRes) => resolve(eRes || []));
      });

      if (empResults.length > 0) {
        const emp = empResults[0];
        const empMatch = await bcrypt.compare(password, emp.password_hash);
        if (empMatch) {
          const resolvedRole = getEmployeeRole(emp);
          const token = jwt.sign(
            { id: emp.id, name: emp.name, email: emp.email, role: resolvedRole, auth_id: emp.id },
            JWT_SECRET,
            { expiresIn: "24h" }
          );

          // Auto-sync into users table if missing
          const syncSql = `
            INSERT INTO users (employee_id, full_name, email, password_hash, role, email_verified, account_status)
            VALUES (?, ?, ?, ?, ?, 1, 'Active')
            ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), account_status = 'Active', email_verified = 1
          `;
          db.query(syncSql, [emp.id, emp.name, emp.email, emp.password_hash, resolvedRole]);

          return res.json({
            success: true,
            token,
            user: {
              id: emp.id,
              name: emp.name,
              email: emp.email,
              role: resolvedRole
            }
          });
        }
      }

      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Check email verification status
    if (!user.email_verified) {
      return res.status(403).json({ success: false, message: "Please verify your email before signing in." });
    }

    // Check account status
    if (user.account_status !== 'Active') {
      return res.status(403).json({ success: false, message: `Your account is currently ${user.account_status}. Access denied.` });
    }

    let resolvedRole = user.role;

    if (loginType === 'admin') {
      if (user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ success: false, message: "Access denied. Only Admins can sign in here." });
      }
    } else {
      // Employee login - query the employees and designations tables to resolve actual role
      if (user.employee_id) {
        const empSql = `
          SELECT e.*, r.name as role_name, desg.role_name as designation_name
          FROM employees e
          LEFT JOIN roles r ON e.role_id = r.id
          LEFT JOIN designations desg ON e.designation_id = desg.id
          WHERE e.id = ?
        `;
        db.query(empSql, [user.employee_id], (empErr, empRes) => {
          if (empErr) {
            console.error("Error resolving employee info:", empErr);
            return res.status(500).json({ success: false, message: "Internal server error" });
          }

          if (empRes.length > 0) {
            resolvedRole = getEmployeeRole(empRes[0]);
          }

          const token = jwt.sign(
            { id: user.employee_id, name: user.full_name, email: user.email, role: resolvedRole, auth_id: user.id },
            JWT_SECRET,
            { expiresIn: "24h" }
          );

          return res.json({
            success: true,
            token,
            user: {
              id: user.employee_id,
              name: user.full_name,
              email: user.email,
              role: resolvedRole
            }
          });
        });
        return;
      }
    }

    const token = jwt.sign(
      { id: user.employee_id || 1, name: user.full_name, email: user.email, role: resolvedRole, auth_id: user.id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.employee_id || 1,
        name: user.full_name,
        email: user.email,
        role: resolvedRole
      }
    });
  });
};

exports.verifyEmailRequest = async (req, res) => {
  const { name, email, role } = req.body;

  if (!email || !role || !name) {
    return res.status(400).json({ success: false, message: "Name, email, and role are required." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // 1. Check duplicate account in users table
  const dupCheckSql = "SELECT id FROM users WHERE LOWER(email) = LOWER(?)";
  db.query(dupCheckSql, [cleanEmail], async (dupErr, dupRes) => {
    if (dupErr) {
      console.error(dupErr);
      return res.status(500).json({ success: false, message: "Database query error" });
    }

    if (dupRes.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "An account already exists for this company email. Please sign in instead." 
      });
    }

    // 2. Cooldown check (60 seconds)
    const checkCooldownSql = "SELECT * FROM email_verifications WHERE LOWER(email) = LOWER(?)";
    const existingVer = await new Promise((resolve) => {
      db.query(checkCooldownSql, [cleanEmail], (e, r) => resolve(r && r.length > 0 ? r[0] : null));
    });

    if (existingVer) {
      const now = new Date();
      const createdAt = new Date(existingVer.updated_at || existingVer.created_at);
      const diffSeconds = Math.floor((now - createdAt) / 1000);
      if (diffSeconds < 60) {
        return res.status(400).json({ 
          success: false,
          message: `Resend available in ${60 - diffSeconds} seconds. Please wait.` 
        });
      }
    }

    // 3. Authorization check
    if (role === 'Admin') {
      const adminCountSql = "SELECT COUNT(*) as count FROM users WHERE role = 'SUPER_ADMIN'";
      db.query(adminCountSql, async (acErr, acRes) => {
        if (acErr) return res.status(500).json({ success: false, message: "Database error" });

        if (acRes[0].count > 0) {
          return res.status(400).json({ 
            success: false,
            message: "Admin registration is blocked. Additional Admin accounts must be created only through the authorized Admin functionality." 
          });
        }
        
        // Initial setup Admin allowed
        sendOtpToEmail(cleanName, cleanEmail, res);
      });
    } else {
      // Employee registration -> MUST verify exact email exists in Employee database
      const checkEmpSql = `
        SELECT e.*, r.name as role_name, desg.role_name as designation_name
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN designations desg ON e.designation_id = desg.id
        WHERE LOWER(e.email) = LOWER(?)
      `;

      db.query(checkEmpSql, [cleanEmail], async (empErr, empRes) => {
        if (empErr) return res.status(500).json({ success: false, message: "Database error" });

        if (empRes.length === 0) {
          return res.status(400).json({ 
            success: false,
            message: "This company email is not registered in HRMS. Please contact your HR/Admin." 
          });
        }

        const employee = empRes[0];

        // Verify Full Name matches case-insensitively & trimmed
        const cleanDbName = employee.name.toLowerCase().replace(/\s+/g, '');
        const cleanInputName = cleanName.toLowerCase().replace(/\s+/g, '');

        if (cleanDbName !== cleanInputName) {
          return res.status(400).json({ 
            success: false,
            message: "The entered name does not match our records for this company email." 
          });
        }

        // Exact company employee match confirmed -> Send OTP
        sendOtpToEmail(cleanName, cleanEmail, res);
      });
    }
  });
};

async function sendOtpToEmail(name, email, res) {
  try {
    const sessionId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    const otpHash = await bcrypt.hash(otpCode, 10);

    // Invalidate/delete previous verifications for this email
    await new Promise((resolve) => {
      db.query("DELETE FROM email_verifications WHERE LOWER(email) = LOWER(?)", [email], resolve);
    });

    const insertSql = `
      INSERT INTO email_verifications (session_id, email, otp_hash, expires_at, attempt_count, verified)
      VALUES (?, ?, ?, ?, 0, 0)
    `;

    db.query(insertSql, [sessionId, email, otpHash, expiresAt], async (insErr) => {
      if (insErr) {
        console.error("Error inserting email_verifications:", insErr);
        return res.status(500).json({ success: false, message: "Failed to generate verification OTP." });
      }

      // Send REAL email via Nodemailer
      try {
        await emailService.sendOtpEmail({ toEmail: email, recipientName: name, otpCode });
        return res.json({ 
          success: true,
          sessionId,
          message: `Verification code sent to ${email}.`,
          email
        });
      } catch (mailErr) {
        console.error("Failed to send OTP email:", mailErr);
        db.query("DELETE FROM email_verifications WHERE session_id = ?", [sessionId]);
        return res.status(500).json({ 
          success: false,
          message: "Unable to send verification email. Please check your SMTP configuration or try again later." 
        });
      }
    });
  } catch (err) {
    console.error("sendOtpToEmail error:", err);
    res.status(500).json({ success: false, message: "Failed to process OTP request." });
  }
}

exports.verifyOtp = (req, res) => {
  const { email, code, sessionId } = req.body;

  if (!email || !code || !sessionId) {
    return res.status(400).json({ success: false, verified: false, message: "Email, session ID, and 6-digit verification code are required." });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Find verification record matching session_id AND exact email
  const sql = "SELECT * FROM email_verifications WHERE session_id = ? AND LOWER(email) = LOWER(?)";
  db.query(sql, [sessionId, cleanEmail], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, verified: false, message: "Database error." });
    }

    if (results.length === 0) {
      return res.status(400).json({ success: false, verified: false, message: "No verification session found for this email. Please click Verify Email." });
    }

    const record = results[0];

    // 1. Check attempt limit
    if (record.attempt_count >= 5) {
      return res.status(400).json({ success: false, verified: false, message: "Too many incorrect attempts. Please request a new verification code." });
    }

    // 2. Check expiry
    const now = new Date();
    if (new Date(record.expires_at) < now) {
      return res.status(400).json({ success: false, verified: false, message: "This verification code has expired. Please request a new OTP." });
    }

    // 3. Compare OTP code with stored bcrypt hash
    const isMatch = await bcrypt.compare(code, record.otp_hash);

    if (!isMatch) {
      const newAttempts = record.attempt_count + 1;
      const updateAttemptsSql = "UPDATE email_verifications SET attempt_count = ? WHERE id = ?";
      db.query(updateAttemptsSql, [newAttempts, record.id]);

      if (newAttempts >= 5) {
        return res.status(400).json({ success: false, verified: false, message: "Too many incorrect attempts. Please request a new verification code." });
      }

      return res.status(400).json({ 
        success: false, 
        verified: false, 
        message: `Invalid verification code. Please check your email and try again. (${5 - newAttempts} attempts remaining)` 
      });
    }

    // OTP Correct -> Set verified = 1
    const setVerifiedSql = "UPDATE email_verifications SET verified = 1, attempt_count = 0 WHERE id = ?";
    db.query(setVerifiedSql, [record.id], (upErr) => {
      if (upErr) {
        return res.status(500).json({ success: false, verified: false, message: "Failed to verify OTP." });
      }

      res.json({ 
        success: true, 
        verified: true, 
        sessionId,
        email: cleanEmail,
        message: "Email Verified Successfully ✓" 
      });
    });
  });
};

exports.register = async (req, res) => {
  const { name, email, role, password, confirmPassword, sessionId } = req.body;

  if (!name || !email || !role || !password || !confirmPassword || !sessionId) {
    return res.status(400).json({ success: false, message: "All registration fields and valid verification session are required." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match." });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
  }

  // Independent Backend Validation #1: Authorization Membership
  const targetRole = role === 'Admin' ? 'SUPER_ADMIN' : 'EMPLOYEE';

  if (targetRole === 'EMPLOYEE') {
    const findEmpSql = "SELECT id FROM employees WHERE LOWER(email) = LOWER(?)";
    const empRes = await new Promise((resolve) => {
      db.query(findEmpSql, [cleanEmail], (e, r) => resolve(r || []));
    });
    if (empRes.length === 0) {
      return res.status(400).json({ success: false, message: "This company email is not authorized for registration." });
    }
  } else if (targetRole === 'SUPER_ADMIN') {
    const adminCountSql = "SELECT COUNT(*) as count FROM users WHERE role = 'SUPER_ADMIN'";
    const acRes = await new Promise((resolve) => {
      db.query(adminCountSql, (e, r) => resolve(r || []));
    });
    if (acRes && acRes[0] && acRes[0].count > 0) {
      return res.status(400).json({ success: false, message: "Admin registration is unauthorized." });
    }
  }

  // Independent Backend Validation #2: Verification Session & Email Match
  const sqlCheckVer = "SELECT * FROM email_verifications WHERE session_id = ? AND LOWER(email) = LOWER(?) AND verified = 1";
  db.query(sqlCheckVer, [sessionId, cleanEmail], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database query error." });

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: "Email verification required for this exact email. Please verify your email before creating your account." });
    }

    const verRecord = results[0];

    // Independent Backend Validation #3: Expiration Check
    if (new Date(verRecord.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: "Verification session expired. Please verify your email again." });
    }

    // Independent Backend Validation #4: Uniqueness Check
    const dupCheckSql = "SELECT id FROM users WHERE LOWER(email) = LOWER(?)";
    db.query(dupCheckSql, [cleanEmail], async (dupErr, dupRes) => {
      if (dupErr) return res.status(500).json({ success: false, message: "Database error." });

      if (dupRes.length > 0) {
        return res.status(400).json({ success: false, message: "An account already exists for this email." });
      }

      try {
        const password_hash = await bcrypt.hash(password, 10);
        let employee_id = null;

        if (targetRole === 'EMPLOYEE') {
          const findEmpSql = "SELECT id FROM employees WHERE LOWER(email) = LOWER(?)";
          const empRes = await new Promise((resolve) => {
            db.query(findEmpSql, [cleanEmail], (e, r) => resolve(r || []));
          });
          if (empRes.length > 0) {
            employee_id = empRes[0].id;
          }
        }

        const insertUserSql = `
          INSERT INTO users (employee_id, full_name, email, password_hash, role, email_verified, email_verified_at, account_status)
          VALUES (?, ?, ?, ?, ?, 1, NOW(), 'Active')
        `;

        db.query(insertUserSql, [employee_id, cleanName, cleanEmail, password_hash, targetRole], (insErr) => {
          if (insErr) {
            console.error(insErr);
            return res.status(500).json({ success: false, message: "Failed to create user account." });
          }

          // Clean up verification session
          db.query("DELETE FROM email_verifications WHERE session_id = ?", [sessionId]);

          res.json({ success: true, message: "Account Created Successfully ✓", redirect: true });
        });
      } catch (hashErr) {
        res.status(500).json({ success: false, message: "Server password hashing error." });
      }
    });
  });
};
