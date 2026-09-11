const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { authenticateJWT, checkPermission } = require("../middlewares/auth");

// Support Tickets Endpoints
router.get("/", authenticateJWT, checkPermission('helpdesk', 'support_tickets', 'view'), (req, res) => {
  const sql = `
    SELECT 
      id,
      ticket_code as id_str,
      subject,
      category as cat,
      priority,
      requester,
      status,
      DATE_FORMAT(created_at, '%d %b %Y %h:%i %p') as date
    FROM helpdesk_tickets
    ORDER BY id DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      // Fallback table creation if missing
      db.query(`
        CREATE TABLE IF NOT EXISTS helpdesk_tickets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ticket_code VARCHAR(50) DEFAULT NULL,
          subject VARCHAR(255) NOT NULL,
          category VARCHAR(100) DEFAULT 'IT Support',
          priority VARCHAR(50) DEFAULT 'Medium',
          requester VARCHAR(100) DEFAULT 'Employee',
          status VARCHAR(50) DEFAULT 'Open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `, () => {
        res.json([]);
      });
      return;
    }
    res.json(rows.map(r => ({
      id: r.ticket_code || `TKT-${r.id}`,
      db_id: r.id,
      subject: r.subject,
      cat: r.cat,
      priority: r.priority,
      requester: r.requester,
      status: r.status,
      date: r.date
    })));
  });
});

router.post("/", authenticateJWT, checkPermission('helpdesk', 'support_tickets', 'create'), (req, res) => {
  const { subject, cat, priority, requester } = req.body;
  const sql = `
    INSERT INTO helpdesk_tickets (ticket_code, subject, category, priority, requester, status)
    VALUES (?, ?, ?, ?, ?, 'Open')
  `;
  const code = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  db.query(sql, [code, subject, cat || 'IT Support', priority || 'Medium', requester || 'User'], (err, result) => {
    if (err) return res.status(500).json(err);

    const creatorId = req.user?.employeeId || req.user?.employee_id || req.user?.id || 1;
    try {
      const NotificationService = require("../services/NotificationService");
      NotificationService.triggerHelpDeskCreated(result.insertId || code, creatorId, subject)
        .catch(e => console.error("Ticket notification error:", e));
    } catch (e) { }

    res.json({ message: "Ticket created successfully", id: code });
  });
});

router.put("/:id/status", authenticateJWT, checkPermission('helpdesk', 'support_tickets', 'edit'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query("SELECT * FROM helpdesk_tickets WHERE ticket_code = ? OR id = ?", [id, id], (errFetch, rows) => {
    db.query("UPDATE helpdesk_tickets SET status = ? WHERE ticket_code = ? OR id = ?", [status, id, id], (err, result) => {
      if (err) return res.status(500).json(err);

      if (rows && rows.length > 0) {
        const ticket = rows[0];
        try {
          const NotificationService = require("../services/NotificationService");
          NotificationService.triggerHelpDeskStatusUpdate(ticket.id, ticket.employee_id || 1, ticket.subject, status)
            .catch(e => console.error("Ticket status notification error:", e));
        } catch (e) { }
      }

      res.json({ message: "Ticket status updated successfully" });
    });
  });
});

// Knowledge Base Articles
router.get("/kb/articles", authenticateJWT, checkPermission('helpdesk', 'knowledge_base', 'view'), (req, res) => {
  const sql = "SELECT * FROM helpdesk_articles ORDER BY id DESC";
  db.query(sql, (err, rows) => {
    if (err) {
      db.query(`
        CREATE TABLE IF NOT EXISTS helpdesk_articles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) DEFAULT 'IT Support',
          views INT DEFAULT 0,
          status VARCHAR(50) DEFAULT 'Published',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `, () => res.json([]));
      return;
    }
    res.json(rows.map(r => ({
      id: r.id,
      title: r.title,
      cat: r.category,
      views: String(r.views || 100),
      status: r.status,
      date: new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    })));
  });
});

// Helpdesk Categories
router.get("/categories", authenticateJWT, checkPermission('helpdesk', 'helpdesk_categories', 'view'), (req, res) => {
  const sql = "SELECT * FROM helpdesk_categories ORDER BY id ASC";
  db.query(sql, (err, rows) => {
    if (err) {
      db.query(`
        CREATE TABLE IF NOT EXISTS helpdesk_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT DEFAULT NULL,
          total_tickets INT DEFAULT 0,
          status VARCHAR(20) DEFAULT 'Active'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `, () => res.json([]));
      return;
    }
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      desc: r.description,
      total: r.total_tickets || 20,
      status: r.status
    })));
  });
});

// Company NewsFeed
router.get("/newsfeed", authenticateJWT, (req, res) => {
  const sql = "SELECT * FROM newsfeed ORDER BY pinned DESC, id DESC";
  db.query(sql, (err, rows) => {
    if (err) {
      db.query(`
        CREATE TABLE IF NOT EXISTS newsfeed (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT DEFAULT NULL,
          author VARCHAR(100) DEFAULT 'HR Team',
          role VARCHAR(100) DEFAULT 'Management',
          category VARCHAR(50) DEFAULT 'GENERAL',
          pinned TINYINT(1) DEFAULT 0,
          likes INT DEFAULT 0,
          comments INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `, () => res.json([]));
      return;
    }
    res.json(rows.map(r => ({
      id: String(r.id),
      title: r.title,
      content: r.content,
      author: r.author,
      role: r.role,
      date: r.created_at,
      category: r.category,
      pinned: Boolean(r.pinned),
      likes: r.likes || 0,
      comments: r.comments || 0
    })));
  });
});

// Welcome Kits Distribution
router.get("/welcome-kits", authenticateJWT, (req, res) => {
  const sql = `
    SELECT 
      COALESCE(e.employee_code, CONCAT('EMP00', e.id)) as id,
      e.name,
      COALESCE(d.dept_name, e.department, 'Engineering') as dept,
      COALESCE(DATE_FORMAT(e.date_of_joining, '%d %b %Y'), '16 May 2024') as date
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY e.id DESC
    LIMIT 20
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

module.exports = router;

