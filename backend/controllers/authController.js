const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "madhura_super_secret_key_2026";

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  const sql = `
    SELECT e.*, r.name as role_name 
    FROM employees e
    LEFT JOIN roles r ON e.role_id = r.id
    WHERE e.email = ?
  `;

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database query error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role_name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name
      }
    });
  });
};

exports.register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const assignedRole = role || 'SERVICE_STAFF';

    // First ensure the role exists
    db.query("INSERT IGNORE INTO roles (name) VALUES (?)", [assignedRole], (err) => {
      if (err) {
        console.error("Failed to create role", err);
      }

      const sql = `
        INSERT INTO employees (name, email, password_hash, phone, role_id)
        VALUES (?, ?, ?, ?, (SELECT id FROM roles WHERE name = ?))
      `;

      db.query(sql, [name, email, password_hash, phone, assignedRole], (err, result) => {
        if (err) {
          console.error(err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Email already exists" });
          }
          return res.status(500).json({ message: "Registration failed" });
        }
        res.json({ message: "User registered successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
