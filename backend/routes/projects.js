const express = require("express");
const router = express.Router();
const db = require("../config/database");

/**
 * GET ALL PROJECTS
 */
router.get("/", (req, res) => {
  db.query("SELECT * FROM projects", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/**
 * CREATE PROJECT
 */
router.post("/", (req, res) => {
  const { name, description, start_date, end_date, status } = req.body;
  const sql = "INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, description, start_date, end_date, status || 'Not Started'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Project created successfully", id: result.insertId });
  });
});

/**
 * GET ALL TASKS (optionally filtered by Project)
 */
router.get("/tasks", (req, res) => {
  const { project_id } = req.query;
  let sql = `
    SELECT t.*, p.name as project_name, e.name as assignee_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN employees e ON t.assignee_id = e.id
  `;
  const params = [];
  if (project_id) {
    sql += " WHERE t.project_id = ?";
    params.push(project_id);
  }
  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/**
 * CREATE TASK
 */
router.post("/tasks", (req, res) => {
  const { project_id, title, description, assignee_id, priority, status, due_date } = req.body;
  const sql = `
    INSERT INTO tasks (project_id, title, description, assignee_id, priority, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [project_id, title, description, assignee_id, priority || 'Medium', status || 'Todo', due_date], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Task created successfully", id: result.insertId });
  });
});

module.exports = router;
