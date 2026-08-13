const db = require("../config/database");

exports.getAppraisals = (req, res) => {
  const sql = `
    SELECT ap.*, e.name as employee_name, d.dept_name as department
    FROM appraisals ap
    JOIN employees e ON ap.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY ap.id DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.createAppraisal = (req, res) => {
  const { employee_id, performance_score, review_period } = req.body;
  if (!employee_id || !performance_score || !review_period) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = "INSERT INTO appraisals (employee_id, performance_score, status, review_period) VALUES (?, ?, 'Pending', ?)";
  db.query(sql, [employee_id, performance_score, review_period], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Appraisal record created", id: result.insertId });
  });
};
