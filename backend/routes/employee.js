const express = require("express");
const router = express.Router();
const db = require("../config/database");
const bcrypt = require("bcryptjs");

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
    salesTarget,
    branch,
    role,
    department,
    password
  } = req.body;

  try {
    const defaultPassword = password || "Madhura2026";
    const password_hash = await bcrypt.hash(defaultPassword, 10);

    const sql = `
      INSERT INTO employees
      (name, email, phone, dob, join_date, sales_target, branch_id, department_id, designation_id, password_hash)
      VALUES (
        ?, ?, ?, ?, ?, ?,
        (SELECT id FROM branches WHERE branch_name = ? LIMIT 1),
        (SELECT id FROM departments WHERE dept_name = ? LIMIT 1),
        (SELECT id FROM designations WHERE role_code = ? LIMIT 1),
        ?
      )
    `;

    db.query(
      sql,
      [name, email, phone, dob, joinDate, salesTarget || 0, branch, department, role, password_hash],
      (err, result) => {
        if (err) {
          console.error(err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Employee email already exists" });
          }
          return res.status(500).json({ message: "Employee creation failed" });
        }
        res.json({ message: "Employee created successfully", id: result.insertId });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error during creation" });
  }
});

/**
 * GET ALL EMPLOYEES
 */
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      e.id,
      e.name,
      e.email,
      e.phone,
      e.dob,
      e.join_date,
      e.sales_target,
      b.branch_name,
      dept.dept_name,
      d.role_name
    FROM employees e
    LEFT JOIN branches b ON e.branch_id = b.id
    LEFT JOIN departments dept ON e.department_id = dept.id
    LEFT JOIN designations d ON e.designation_id = d.id
    ORDER BY e.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

module.exports = router;
