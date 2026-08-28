const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all tasks
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT 
                t.*,
                e.name as assignee_name
            FROM task_board t
            LEFT JOIN employees e ON t.assignee_id = e.id
            ORDER BY t.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

// Get task by ID
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT 
                t.*,
                e.name as assignee_name
            FROM task_board t
            LEFT JOIN employees e ON t.assignee_id = e.id
            WHERE t.id = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch task" });
    }
});

// Create task
router.post("/", async (req, res) => {
    try {
        const { title, description, status, priority, assignee_id, due_date } = req.body;
        const [result] = await db.promise().query(`
            INSERT INTO task_board (title, description, status, priority, assignee_id, due_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [title, description, status || 'todo', priority || 'medium', assignee_id, due_date]);
        res.json({ id: result.insertId, message: "Task created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create task" });
    }
});

// Update task status
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        await db.promise().query(`UPDATE task_board SET status = ? WHERE id = ?`, [status, req.params.id]);
        res.json({ message: "Task status updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update task status" });
    }
});

module.exports = router;
