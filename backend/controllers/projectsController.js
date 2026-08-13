const db = require("../config/database");

exports.getProjects = (req, res) => {
  db.query("SELECT * FROM projects", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

exports.createProject = (req, res) => {
  const { name, description, start_date, end_date, status } = req.body;
  const sql = "INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, description, start_date, end_date, status || 'Not Started'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Project created successfully", id: result.insertId });
  });
};

exports.getTasks = (req, res) => {
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
};

exports.createTask = (req, res) => {
  const { project_id, title, description, assignee_id, priority, status, due_date } = req.body;
  const sql = `
    INSERT INTO tasks (project_id, title, description, assignee_id, priority, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [project_id, title, description, assignee_id, priority || 'Medium', status || 'Todo', due_date], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Task created successfully", id: result.insertId });
  });
};
