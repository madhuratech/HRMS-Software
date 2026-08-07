const db = require("../config/database");

exports.getExpenses = (req, res) => {
  const sql = `
    SELECT ex.*, e.name as employee_name 
    FROM expenses ex
    JOIN employees e ON ex.employee_id = e.id
    ORDER BY ex.date DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.createExpense = (req, res) => {
  const { employee_id, amount, date, category, description } = req.body;
  if (!employee_id || !amount || !date || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO expenses (employee_id, amount, date, category, description, status)
    VALUES (?, ?, ?, ?, ?, 'Pending')
  `;
  db.query(sql, [employee_id, amount, date, category, description], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Expense claim submitted successfully", id: result.insertId });
  });
};

exports.approveExpense = (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Approved or Rejected
  if (!status) return res.status(400).json({ message: "Status is required" });

  const sql = "UPDATE expenses SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: `Expense status updated to ${status}` });
  });
};
