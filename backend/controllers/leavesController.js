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
