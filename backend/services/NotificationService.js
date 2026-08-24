const db = require('../config/database');

class NotificationService {
  /**
   * Helper to fetch employee details including role key
   */
  static async getEmployeeDetails(employeeId) {
    return new Promise((resolve) => {
      const sql = `
        SELECT e.*, r.role_key 
        FROM employees e 
        LEFT JOIN roles r ON e.role_id = r.id 
        WHERE e.id = ?
      `;
      db.query(sql, [employeeId], (err, rows) => {
        if (err || rows.length === 0) resolve(null);
        else resolve(rows[0]);
      });
    });
  }

  /**
   * General method to create a single notification in DB
   */
  static async createNotification({
    recipient_user_id,
    recipient_employee_id,
    role,
    team_id,
    type,
    title,
    message,
    entity_type,
    entity_id,
    action_url
  }) {
    // Avoid duplicates for specific unique events
    if (entity_type && entity_id && type && (recipient_employee_id || recipient_user_id)) {
      const checkSql = `
        SELECT id FROM notifications 
        WHERE type = ? AND entity_type = ? AND entity_id = ? 
          AND (recipient_employee_id = ? OR recipient_user_id = ?)
      `;
      const exists = await new Promise((resolve) => {
        db.query(checkSql, [type, entity_type, entity_id, recipient_employee_id || null, recipient_user_id || null], (err, rows) => {
          if (err) resolve(false);
          else resolve(rows.length > 0);
        });
      });
      if (exists) return null;
    }

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO notifications 
        (recipient_user_id, recipient_employee_id, role, team_id, type, title, message, entity_type, entity_id, action_url, is_read, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
      `;
      db.query(
        sql,
        [
          recipient_user_id || null,
          recipient_employee_id || null,
          role || null,
          team_id || null,
          type,
          title,
          message,
          entity_type || null,
          entity_id || null,
          action_url || null
        ],
        (err, res) => {
          if (err) {
            console.error('Error inserting notification:', err);
            return reject(err);
          }
          resolve({ id: res.insertId, title });
        }
      );
    });
  }

  /**
   * Notify admins and HR managers
   */
  static async notifyAdminsAndHR(type, title, message, entityType, entityId, actionUrl) {
    return new Promise((resolve) => {
      const sql = `
        SELECT e.id, e.team_id, r.role_key 
        FROM employees e 
        JOIN roles r ON e.role_id = r.id 
        WHERE r.role_key IN ('SUPER_ADMIN', 'HR_MANAGER') AND e.status = 'Active'
      `;
      db.query(sql, [], async (err, rows) => {
        if (err) return resolve([]);
        const promises = rows.map(user => 
          this.createNotification({
            recipient_employee_id: user.id,
            role: user.role_key,
            team_id: user.team_id,
            type,
            title,
            message,
            entity_type: entityType,
            entity_id: entityId,
            action_url: actionUrl
          })
        );
        const results = await Promise.all(promises);
        resolve(results);
      });
    });
  }

  /**
   * Notify team leaders of a specific team
   */
  static async notifyTeamLeaders(teamId, type, title, message, entityType, entityId, actionUrl) {
    if (!teamId) return [];
    return new Promise((resolve) => {
      const sql = `
        SELECT e.id, e.team_id, r.role_key 
        FROM employees e 
        JOIN roles r ON e.role_id = r.id 
        WHERE r.role_key = 'TEAM_LEADER' AND e.team_id = ? AND e.status = 'Active'
      `;
      db.query(sql, [teamId], async (err, rows) => {
        if (err) return resolve([]);
        const promises = rows.map(user => 
          this.createNotification({
            recipient_employee_id: user.id,
            role: user.role_key,
            team_id: user.team_id,
            type,
            title,
            message,
            entity_type: entityType,
            entity_id: entityId,
            action_url: actionUrl
          })
        );
        const results = await Promise.all(promises);
        resolve(results);
      });
    });
  }

  /**
   * Notify all active employees (e.g. for company announcements, holiday updates)
   */
  static async notifyAllEmployees(type, title, message, entityType, entityId, actionUrl) {
    return new Promise((resolve) => {
      const sql = `
        SELECT e.id, e.team_id, r.role_key 
        FROM employees e 
        JOIN roles r ON e.role_id = r.id 
        WHERE e.status = 'Active'
      `;
      db.query(sql, [], async (err, rows) => {
        if (err) return resolve([]);
        const promises = rows.map(user => 
          this.createNotification({
            recipient_employee_id: user.id,
            role: user.role_key,
            team_id: user.team_id,
            type,
            title,
            message,
            entity_type: entityType,
            entity_id: entityId,
            action_url: actionUrl
          })
        );
        const results = await Promise.all(promises);
        resolve(results);
      });
    });
  }

  /**
   * Trigger Leave Request notification flow
   */
  static async triggerLeaveRequest(leaveApplicationId, employeeId, leaveTypeName, startDateStr, endDateStr) {
    const emp = await this.getEmployeeDetails(employeeId);
    if (!emp) return;

    const title = 'New Leave Request';
    const message = `${emp.name} submitted a leave request: ${leaveTypeName || 'Leave'} from ${startDateStr} to ${endDateStr}.`;
    const actionUrl = '/leave-approval';

    // 1. Notify HR and Admin
    await this.notifyAdminsAndHR('LEAVE_REQUEST', title, message, 'leave', leaveApplicationId, actionUrl);

    // 2. Notify their Team Leader (if applicable)
    if (emp.team_id) {
      const tlTitle = 'Team Leave Request';
      const tlMessage = `${emp.name} from your team requested leave: ${leaveTypeName || 'Leave'} (${startDateStr} - ${endDateStr}).`;
      const tlActionUrl = '/team-leader/team-leave';
      await this.notifyTeamLeaders(emp.team_id, 'LEAVE_REQUEST', tlTitle, tlMessage, 'leave', leaveApplicationId, tlActionUrl);
    }
  }

  /**
   * Trigger Leave Status Update (Approved/Rejected/Cancelled)
   */
  static async triggerLeaveStatusUpdate(leaveApplicationId, employeeId, leaveTypeName, status, startDateStr, endDateStr) {
    const emp = await this.getEmployeeDetails(employeeId);
    if (!emp) return;

    const type = status === 'Approved' ? 'LEAVE_APPROVED' : status === 'Rejected' ? 'LEAVE_REJECTED' : 'LEAVE_CANCELLED';
    const title = `Leave ${status}`;
    const message = `Your ${leaveTypeName || 'Leave'} request for ${startDateStr} - ${endDateStr} has been ${status.toLowerCase()}.`;
    const actionUrl = '/employee/leave';

    await this.createNotification({
      recipient_employee_id: employeeId,
      role: emp.role_key,
      team_id: emp.team_id,
      type,
      title,
      message,
      entity_type: 'leave',
      entity_id: leaveApplicationId,
      action_url: actionUrl
    });
  }

  /**
   * Trigger Task Assignment notification
   */
  static async triggerTaskAssignment(taskId, taskTitle, assigneeId, dueDateStr) {
    const emp = await this.getEmployeeDetails(assigneeId);
    if (!emp) return;

    const title = 'New Task Assigned';
    const message = `You have been assigned a new task: ${taskTitle}. Due: ${dueDateStr || 'N/A'}`;
    const actionUrl = '/employee/tasks';

    await this.createNotification({
      recipient_employee_id: assigneeId,
      role: emp.role_key,
      team_id: emp.team_id,
      type: 'TASK_ASSIGNED',
      title,
      message,
      entity_type: 'task',
      entity_id: taskId,
      action_url: actionUrl
    });
  }

  /**
   * Trigger Project Assignment notification
   */
  static async triggerProjectAssignment(projectId, projectName, employeeId) {
    const emp = await this.getEmployeeDetails(employeeId);
    if (!emp) return;

    const title = 'Added to Project';
    const message = `You have been added to the project: ${projectName}.`;
    const actionUrl = '/projects';

    await this.createNotification({
      recipient_employee_id: employeeId,
      role: emp.role_key,
      team_id: emp.team_id,
      type: 'PROJECT_ASSIGNED',
      title,
      message,
      entity_type: 'project',
      entity_id: projectId,
      action_url: actionUrl
    });
  }

  /**
   * Trigger Employee Profile Update notification
   */
  static async triggerEmployeeProfileUpdate(employeeId, updaterName) {
    const emp = await this.getEmployeeDetails(employeeId);
    if (!emp) return;

    const title = 'Employee Profile Updated';
    const message = `${emp.name} updated their profile information.`;
    const actionUrl = '/employees/profile';

    await this.notifyAdminsAndHR('EMPLOYEE_UPDATE', title, message, 'employee', employeeId, actionUrl);
  }

  /**
   * Trigger Permission Update notification
   */
  static async triggerPermissionUpdate(employeeId, moduleKeyName) {
    const emp = await this.getEmployeeDetails(employeeId);
    if (!emp) return;

    const title = 'Permission Updated';
    const message = `Your access permissions for ${moduleKeyName || 'user roles'} have been updated.`;
    const actionUrl = '/settings/users';

    await this.createNotification({
      recipient_employee_id: employeeId,
      role: emp.role_key,
      team_id: emp.team_id,
      type: 'PERMISSION_UPDATED',
      title,
      message,
      entity_type: 'permission',
      entity_id: moduleKeyName || 'rbac',
      action_url: actionUrl
    });
  }

  /**
   * Trigger Holiday Update notification
   */
  static async triggerHolidayUpdate(holidayId, holidayName, dateStr) {
    const title = 'Holiday Update';
    const message = `A new company holiday has been added: ${holidayName} on ${dateStr}.`;
    const actionUrl = '/holiday-list';

    await this.notifyAllEmployees('HOLIDAY_UPDATED', title, message, 'holiday', holidayId, actionUrl);
  }

  /**
   * Trigger HR Announcement notification
   */
  static async triggerHRAnnouncement(announcementId, announcementTitle) {
    const title = 'HR Update';
    const message = `New announcement: "${announcementTitle}".`;
    const actionUrl = '/employee/announcements';

    await this.notifyAllEmployees('HR_ANNOUNCEMENT', title, message, 'announcement', announcementId, actionUrl);
  }

  /**
   * Trigger Payslip Available notification
   */
  static async triggerPayslipAvailable(payslipId, employeeId, periodMonth, periodYear) {
    const emp = await this.getEmployeeDetails(employeeId);
    if (!emp) return;

    const title = 'Payslip Available';
    const message = `Your payslip for ${periodMonth} ${periodYear} is now available.`;
    const actionUrl = '/employee/payroll';

    await this.createNotification({
      recipient_employee_id: employeeId,
      role: emp.role_key,
      team_id: emp.team_id,
      type: 'PAYROLL_AVAILABLE',
      title,
      message,
      entity_type: 'payslip',
      entity_id: payslipId,
      action_url: actionUrl
    });
  }
}

module.exports = NotificationService;
