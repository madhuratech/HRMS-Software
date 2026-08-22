const express = require("express");
const router = express.Router();
const db = require("../config/database");

/**
 * CREATE EMPLOYEE
 */
router.post("/", (req, res) => {
  const {
    name,
    email,
    phone,
    dob,
    joinDate,
    salesTarget,
    branch,
    role
  } = req.body;

  const sql = `
    INSERT INTO employees
    (name, email, phone, dob, join_date, sales_target, branch_id, designation_id)
    VALUES (
      ?, ?, ?, ?, ?, ?,
      (SELECT id FROM branches WHERE branch_name = ?),
      (SELECT id FROM designations WHERE role_code = ?)
    )
  `;

  db.query(
    sql,
    [name, email, phone, dob, joinDate, salesTarget, branch, role],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Employee creation failed" });
      }
      res.json({ message: "Employee created successfully" });
    }
  );
});

/**
 * GET ALL EMPLOYEES (Single SELECT)
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
      d.role_name
    FROM employees e
    JOIN branches b ON e.branch_id = b.id
    JOIN designations d ON e.designation_id = d.id
    ORDER BY e.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

module.exports = router;
