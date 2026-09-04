const db = require('../config/database');
const IdentityService = require('../services/IdentityService');

const NotificationController = {
  /**
   * Get notifications for the authenticated user
   */
  async getNotifications(req, res) {
    try {
      const authIdentifier = (req.user && (req.user.email || req.user.userId || req.user.id || req.user.employeeId || req.user.employee_id)) || 1;
      const identity = await IdentityService.resolveUser(authIdentifier);

      const userId = identity?.userId || req.user?.userId || req.user?.id || 1;
      const employeeId = identity?.employeeId || req.user?.employeeId || req.user?.employee_id || 1;
      const roleKey = (identity?.role || req.user?.role || 'EMPLOYEE').toUpperCase();
      const teamId = identity?.teamId;

      // Fetch notifications: direct recipient matches or role-based fallback matches
      let sql = `
        SELECT * FROM notifications 
        WHERE recipient_employee_id = ? OR recipient_user_id = ?
      `;
      const params = [employeeId, userId];

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
          userId,
          employeeId,
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
      const authIdentifier = (req.user && (req.user.email || req.user.userId || req.user.id || req.user.employeeId || req.user.employee_id)) || 1;
      const identity = await IdentityService.resolveUser(authIdentifier);

      const userId = identity?.userId || req.user?.userId || req.user?.id || 1;
      const employeeId = identity?.employeeId || req.user?.employeeId || req.user?.employee_id || 1;
      const roleKey = (identity?.role || req.user?.role || 'EMPLOYEE').toUpperCase();
      const teamId = identity?.teamId;

      let checkSql = `
        SELECT * FROM notifications 
        WHERE id = ? AND (recipient_employee_id = ? OR recipient_user_id = ?
      `;
      const checkParams = [id, employeeId, userId];

      if (roleKey === 'SUPER_ADMIN' || roleKey === 'ADMIN') {
        checkSql += ` OR role = 'SUPER_ADMIN' OR role = 'ADMIN'`;
      } else if (roleKey === 'HR_MANAGER' || roleKey === 'HR') {
        checkSql += ` OR role = 'HR_MANAGER' OR role = 'HR'`;
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
      const authIdentifier = (req.user && (req.user.email || req.user.userId || req.user.id || req.user.employeeId || req.user.employee_id)) || 1;
      const identity = await IdentityService.resolveUser(authIdentifier);

      const userId = identity?.userId || req.user?.userId || req.user?.id || 1;
      const employeeId = identity?.employeeId || req.user?.employeeId || req.user?.employee_id || 1;
      const roleKey = (identity?.role || req.user?.role || 'EMPLOYEE').toUpperCase();
      const teamId = identity?.teamId;

      let sql = `
        UPDATE notifications 
        SET is_read = 1 
        WHERE is_read = 0 AND (recipient_employee_id = ? OR recipient_user_id = ?
      `;
      const params = [employeeId, userId];

      if (roleKey === 'SUPER_ADMIN' || roleKey === 'ADMIN') {
        sql += ` OR role = 'SUPER_ADMIN' OR role = 'ADMIN'`;
      } else if (roleKey === 'HR_MANAGER' || roleKey === 'HR') {
        sql += ` OR role = 'HR_MANAGER' OR role = 'HR'`;
      } else if (roleKey === 'TEAM_LEADER' && teamId) {
        sql += ` OR (role = 'TEAM_LEADER' AND team_id = ?)`;
        params.push(teamId);
      }
      sql += `)`;

      db.query(sql, params, (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Failed to mark all as read' });
        }
        return res.json({ success: true, message: 'All notifications marked as read' });
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = NotificationController;
