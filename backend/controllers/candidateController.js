const db = require("../config/database");

exports.getCandidates = (req, res) => {
  db.query("SELECT * FROM candidates ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.createCandidate = (req, res) => {
  const { name, email, phone, stage, score } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const sql = "INSERT INTO candidates (name, email, phone, stage, score) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, email, phone, stage || 'Applied', score || null], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Candidate email already registered" });
      return res.status(500).json(err);
    }
    res.json({ message: "Candidate registered successfully", id: result.insertId });
  });
};

exports.updateStage = (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;
  if (!stage) return res.status(400).json({ message: "Stage is required" });

  const sql = "UPDATE candidates SET stage = ? WHERE id = ?";
  db.query(sql, [stage, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: `Candidate stage updated to ${stage}` });
  });
};
