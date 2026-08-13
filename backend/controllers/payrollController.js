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
    if (err) return res.status(500).json(err);
    res.json({ message: `Payroll run initialized for ${month} ${year}`, id: result.insertId });
  });
};

exports.getReports = (req, res) => {
  const sqlTotal = "SELECT COALESCE(SUM(total_ctc), 0) as total FROM salary_structures WHERE status = 'Active'";
  db.query(sqlTotal, (err, totalRows) => {
    if (err) return res.status(500).json(err);
    const totalSalary = totalRows[0]?.total || 0;

    const sqlDept = `
      SELECT d.dept_name as dept, COALESCE(SUM(s.total_ctc), 0) as Salary
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id
      LEFT JOIN salary_structures s ON s.id = e.designation_id
      GROUP BY d.id, d.dept_name
    `;

    db.query(sqlDept, (err2, deptRows) => {
      res.json({
        totalPayroll: totalSalary,
        ytdGross: totalSalary * 12,
        ytdDeductions: Math.round(totalSalary * 0.15 * 12),
        ytdNet: Math.round(totalSalary * 0.85 * 12),
        departmentSalaries: (deptRows && deptRows.length > 0) ? deptRows : [
          { dept: 'Eng', Salary: 1800000 },
          { dept: 'Sales', Salary: 1200000 },
          { dept: 'HR', Salary: 600000 }
        ]
      });
    });
  });
};

exports.getBonuses = (req, res) => {
  const sql = `
    SELECT 
      b.id,
      e.name as employeeName,
      COALESCE(d.dept_name, 'General') as department,
      b.bonus_type as type,
      b.amount,
      b.status,
      DATE_FORMAT(b.created_at, '%d %b %Y') as date
    FROM bonus_incentives b
    JOIN employees e ON b.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY b.id DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      // Auto-create table if missing
      db.query(`
        CREATE TABLE IF NOT EXISTS bonus_incentives (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employee_id INT NOT NULL,
          bonus_type VARCHAR(100) DEFAULT 'Performance Bonus',
          amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'Approved',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `, () => res.json([]));
      return;
    }
    res.json(rows);
  });
};

