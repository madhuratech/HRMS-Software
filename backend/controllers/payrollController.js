const db = require("../config/database");

exports.getStructures = (req, res) => {
  db.query("SELECT * FROM salary_structures", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.createStructure = (req, res) => {
  const { name, code, frequency, amount, status } = req.body;
  const sql = `
    INSERT INTO salary_structures (name, code, frequency, total_ctc, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [name, code, frequency, amount, status || 'Active'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Salary structure created successfully", id: result.insertId });
  });
};

exports.getComponents = (req, res) => {
  db.query("SELECT * FROM salary_components", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.createComponent = (req, res) => {
  const { name, type, taxable, formula, frequency, status } = req.body;
  const sql = `
    INSERT INTO salary_components (name, type, taxable, formula, frequency, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [name, type, taxable, formula, frequency, status || 'Active'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Salary component created successfully", id: result.insertId });
  });
};

exports.getRuns = (req, res) => {
  db.query("SELECT * FROM payroll_runs ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.initializeRun = (req, res) => {
  const { month, year } = req.body;
  const sql = "INSERT INTO payroll_runs (period_month, period_year, status) VALUES (?, ?, 'Draft')";
  db.query(sql, [month, year], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Payroll run already initialized for this period." });
      }
      return res.status(500).json(err);
    }
    res.json({ message: `Payroll run initialized for ${month} ${year}`, id: result.insertId });
  });
};
