const db = require('../config/database');

db.query('SELECT 1 FROM notifications LIMIT 1', (err, rows) => {
  if (err) {
    console.log('Notifications table missing, creating...');
    const createSql = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_employee_id INT NULL,
        role VARCHAR(50) NULL,
        team_id INT NULL,
        type VARCHAR(50) DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT,
        action_url VARCHAR(255) NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    db.query(createSql, (cErr) => {
      console.log('Created notifications table:', cErr || 'SUCCESS');
      process.exit(0);
    });
  } else {
    console.log('Notifications table exists!');
    process.exit(0);
  }
});
