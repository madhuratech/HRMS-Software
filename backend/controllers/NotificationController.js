const db = require('../config/database');

const NotificationController = {
  /**
   * Get notifications for the authenticated user
   */
  async getNotifications(req, res) {
    try {
      const rawId = req.user?.id || req.user?.employee_id || 1;
      const parsedId = parseInt(rawId);
      const employeeId = (!isNaN(parsedId) && parsedId > 0) ? parsedId : 1;

      // Fetch employee's real role and team from DB
      const userSql = `
        SELECT e.id, e.team_id, r.role_key 
        FROM employees e 
        LEFT JOIN roles r ON e.role_id = r.id 
        WHERE e.id = ?
      `;

      db.query(userSql, [employeeId], (userErr, userRows) => {
        if (userErr) {
          console.error('[NOTIFICATIONS ERROR] User lookup error:', userErr);
          return res.json({ success: true, notifications: [], data: [], unreadCount: 0 });
        }

        if (!userRows || userRows.length === 0) {
          console.log('[NOTIFICATIONS]', {
            userId: req.user?.auth_id || req.user?.id,
            employeeId,
            role: req.user?.role || 'UNKNOWN',
            queryCount: 0,
            unreadCount: 0
          });
          return res.json({ success: true, notifications: [], data: [], unreadCount: 0 });
        }

        const user = userRows[0];
        const roleKey = (user.role_key || '').toUpperCase();
        const teamId = user.team_id;

        // Fetch notifications: direct matches or role-based fallback matches
        let sql = `
          SELECT * FROM notifications 
          WHERE recipient_employee_id = ?
        `;
        const params = [user.id];

        if (roleKey === 'SUPER_ADMIN' || roleKey === 'ADMIN') {
          sql += ` OR role = 'SUPER_ADMIN' OR role = 'ADMIN'`;
        } else if (roleKey === 'HR_MANAGER' || roleKey === 'HR') {
          sql += ` OR role = 'HR_MANAGER' OR role = 'HR'`;
        } else if (roleKey === 'TEAM_LEADER' && teamId) {
          sql += ` OR (role = 'TEAM_LEADER' AND team_id = ?)`;
          params.push(teamId);
        }

        sql += ` ORDER BY created_at DESC LIMIT 100`;

        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error('[NOTIFICATIONS ERROR] Query error:', err);
            return res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
          }

          const rawRows = rows || [];
          const notificationsFormatted = rawRows.map(r => ({
            id: r.id,
            title: r.title,
            message: r.message,
            type: r.type,
            isRead: Boolean(r.is_read),
            createdAt: r.created_at,
            actionUrl: r.action_url
          }));
          const unreadCount = notificationsFormatted.filter(n => !n.isRead).length;

          console.log('[NOTIFICATIONS]', {
            userId: req.user?.auth_id || req.user?.id,
            employeeId: user.id,
            role: roleKey,
            queryCount: rawRows.length,
            unreadCount
          });

          return res.json({
            success: true,
            notifications: notificationsFormatted,
            data: rawRows,
            unreadCount
          });
        });
      });
    } catch (e) {
      console.error('[NOTIFICATIONS EXCEPTION]', e);
      return res.status(500).json({ success: false, message: 'Server error during notifications retrieval' });
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const employeeId = req.user?.id || 11;

      // Ensure the notification belongs to the user or their role/team
      const userSql = `
        SELECT e.id, e.team_id, r.role_key 
        FROM employees e 
        LEFT JOIN roles r ON e.role_id = r.id 
        WHERE e.id = ?
      `;

      db.query(userSql, [employeeId], (userErr, userRows) => {
        if (userErr || !userRows || userRows.length === 0) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = userRows[0];
        const roleKey = (user.role_key || '').toUpperCase();
        const teamId = user.team_id;

        let checkSql = `
          SELECT * FROM notifications 
          WHERE id = ? AND (recipient_employee_id = ?
        `;
        const checkParams = [id, user.id];

        if (roleKey === 'SUPER_ADMIN') {
          checkSql += ` OR role = 'SUPER_ADMIN'`;
        } else if (roleKey === 'HR_MANAGER') {
          checkSql += ` OR role = 'HR_MANAGER'`;
        } else if (roleKey === 'TEAM_LEADER' && teamId) {
          checkSql += ` OR (role = 'TEAM_LEADER' AND team_id = ?)`;
          checkParams.push(teamId);
        }
        checkSql += `)`;

        db.query(checkSql, checkParams, (err, rows) => {
          if (err || !rows || rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Access denied to this notification' });
          }

          // Update is_read = 1
          db.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id], (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ success: false, message: 'Failed to update notification status' });
            }
            return res.json({ success: true, message: 'Notification marked as read' });
          });
        });
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  /**
   * Mark all unread notifications for the user as read
   */
  async markAllRead(req, res) {
    try {
      const employeeId = req.user?.id || 11;

      const userSql = `
        SELECT e.id, e.team_id, r.role_key 
        FROM employees e 
        LEFT JOIN roles r ON e.role_id = r.id 
        WHERE e.id = ?
      `;

      db.query(userSql, [employeeId], (userErr, userRows) => {
        if (userErr || !userRows || userRows.length === 0) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = userRows[0];
        const roleKey = (user.role_key || '').toUpperCase();
        const teamId = user.team_id;

        let sql = `
          UPDATE notifications 
          SET is_read = 1 
          WHERE is_read = 0 AND (recipient_employee_id = ?
        `;
        const params = [user.id];

        if (roleKey === 'SUPER_ADMIN') {
          sql += ` OR role = 'SUPER_ADMIN'`;
        } else if (roleKey === 'HR_MANAGER') {
          sql += ` OR role = 'HR_MANAGER'`;
        } else if (roleKey === 'TEAM_LEADER' && teamId) {
          sql += ` OR (role = 'TEAM_LEADER' AND team_id = ?)`;
          params.push(teamId);
        }
        sql += `)`;

        db.query(sql, params, (updateErr) => {
          if (updateErr) {
            console.error('Error marking all notifications read:', updateErr);
            return res.status(500).json({ success: false, message: 'Failed to update notifications' });
          }
          return res.json({ success: true, message: 'All notifications marked as read' });
        });
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = NotificationController;
