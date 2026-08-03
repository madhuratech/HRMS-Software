const express = require("express");
const router = express.Router();
const db = require("../config/database");

//  Punch IN / OUT

router.post("/punch", (req, res) => {
  const { employee_id, punch_type, latitude, longitude } = req.body;

  if (!employee_id || !punch_type) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql = `
    INSERT INTO attendance (employee_id, punch_type, latitude, longitude)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [employee_id, punch_type, latitude, longitude],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Punch failed" });
      }

      res.json({
        success: true,
        message: `Punch ${punch_type} successful`,
      });
    }
  );
});

/**
 * Recent Activity
 */
router.get("/recent/:employee_id", (req, res) => {
  const { employee_id } = req.params;

  const sql = `
    SELECT punch_type, punch_time
    FROM attendance
    WHERE employee_id = ?
    ORDER BY punch_time DESC
    LIMIT 5
  `;

  db.query(sql, [employee_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Fetch failed" });
    res.json(results);
  });
});

module.exports = router;
