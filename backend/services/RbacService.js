const db = require('../config/database');

const MODULE_LIST = [
  { key: 'dashboard', label: 'Dashboard', category: 'Overview' },
  { key: 'organization', label: 'Organization & Structure', category: 'Core HR' },
  { key: 'employees', label: 'Employee Management', category: 'Core HR' },
  { key: 'attendance', label: 'Attendance & Tracking', category: 'Time Management' },
  { key: 'leave', label: 'Leave & Absence', category: 'Time Management' },
  { key: 'payroll', label: 'Payroll & Compensation', category: 'Finance' },
  { key: 'recruitment', label: 'Recruitment & ATS', category: 'Talent Acquisition' },
  { key: 'onboarding', label: 'Onboarding & Probation', category: 'Talent Acquisition' },
  { key: 'performance', label: 'Performance & KPIs', category: 'Performance' },
  { key: 'projects', label: 'Projects & Tasks', category: 'Operations' },
  { key: 'reports', label: 'Reports & Analytics', category: 'Analytics' },
  { key: 'expenses', label: 'Expense Claims', category: 'Finance' },
  { key: 'documents', label: 'Document Management', category: 'Compliance' },
  { key: 'tickets', label: 'Support & Helpdesk', category: 'Support' }
];

class RbacService {
  static getModules() {
    return MODULE_LIST;
  }

  static async getRoles() {
    const roles = await new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, 
          COUNT(e.id) as user_count
        FROM roles r
        LEFT JOIN employees e ON e.role_id = r.id
        GROUP BY r.id
        ORDER BY r.is_system DESC, r.id ASC
      `;
      db.query(sql, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    const formatTitle = (str) => {
      if (!str) return 'Role';
      if (str.includes('_') || str === str.toUpperCase()) {
        return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
      return str;
    };

    const seen = new Set();
    const uniqueRoles = [];

    for (const r of roles) {
      const roleKey = (r.role_key || r.name || `ROLE_${r.id}`).toUpperCase();
      if (!seen.has(roleKey)) {
        seen.add(roleKey);
        const roleName = r.role_name && !r.role_name.includes('_') && r.role_name !== r.role_name.toUpperCase()
          ? r.role_name
          : formatTitle(r.role_name || r.name);

        uniqueRoles.push({
          ...r,
          role_key: roleKey,
          role_name: roleName || `Role ${r.id}`,
          description: r.description || `Permissions and access control for ${roleName || 'this role'}.`
        });
      }
    }

    return uniqueRoles;
  }

  static async getRolePermissions(roleKey) {
    const permissions = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM role_permissions WHERE role_key = ?`;
      db.query(sql, [roleKey], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    // Map rows into a full matrix with defaults for any missing modules
    const permMap = {};
    permissions.forEach(p => {
      permMap[p.module_key] = {
        can_view: Boolean(p.can_view),
        can_create: Boolean(p.can_create),
        can_edit: Boolean(p.can_edit),
        can_delete: Boolean(p.can_delete)
      };
    });

    const fullMatrix = MODULE_LIST.map(m => ({
      module_key: m.key,
      module_label: m.label,
      category: m.category,
      can_view: permMap[m.key] ? permMap[m.key].can_view : (roleKey === 'SUPER_ADMIN'),
      can_create: permMap[m.key] ? permMap[m.key].can_create : (roleKey === 'SUPER_ADMIN'),
      can_edit: permMap[m.key] ? permMap[m.key].can_edit : (roleKey === 'SUPER_ADMIN'),
      can_delete: permMap[m.key] ? permMap[m.key].can_delete : (roleKey === 'SUPER_ADMIN')
    }));

    return fullMatrix;
  }

  static async createRole(data) {
    const { role_name, description, template_role } = data;
    if (!role_name || !role_name.trim()) {
      throw new Error('Role name is required');
    }

    const roleKey = role_name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');

    // Check existing
    const existing = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM roles WHERE role_key = ? OR role_name = ?', [roleKey, role_name.trim()], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    if (existing.length > 0) {
      throw new Error('A role with this name already exists');
    }

    // Insert role
    await new Promise((resolve, reject) => {
      const sql = 'INSERT INTO roles (role_key, role_name, name, description, is_system) VALUES (?, ?, ?, ?, 0)';
      db.query(sql, [roleKey, role_name.trim(), role_name.trim(), description || 'Custom user role'], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    // Copy template permissions or create default view permissions
    let templatePerms = [];
    if (template_role) {
      templatePerms = await this.getRolePermissions(template_role);
    }

    for (const m of MODULE_LIST) {
      const t = templatePerms.find(p => p.module_key === m.key) || { can_view: true, can_create: false, can_edit: false, can_delete: false };
      await new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO role_permissions (role_key, module_key, can_view, can_create, can_edit, can_delete)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [roleKey, m.key, t.can_view ? 1 : 0, t.can_create ? 1 : 0, t.can_edit ? 1 : 0, t.can_delete ? 1 : 0], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    return { role_key: roleKey, role_name: role_name.trim() };
  }

  static async updateRolePermissions(roleKey, matrix, roleInfo) {
    if (roleInfo && roleInfo.role_name) {
      await new Promise((resolve, reject) => {
        const sql = 'UPDATE roles SET role_name = ?, description = ? WHERE role_key = ?';
        db.query(sql, [roleInfo.role_name, roleInfo.description || '', roleKey], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    if (Array.isArray(matrix)) {
      for (const item of matrix) {
        await new Promise((resolve, reject) => {
          const sql = `
            INSERT INTO role_permissions (role_key, module_key, can_view, can_create, can_edit, can_delete)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              can_view = VALUES(can_view),
              can_create = VALUES(can_create),
              can_edit = VALUES(can_edit),
              can_delete = VALUES(can_delete)
          `;
          db.query(sql, [
            roleKey,
            item.module_key,
            item.can_view ? 1 : 0,
            item.can_create ? 1 : 0,
            item.can_edit ? 1 : 0,
            item.can_delete ? 1 : 0
          ], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }

    return true;
  }

  static async deleteRole(roleKey) {
    const roleRows = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM roles WHERE role_key = ?', [roleKey], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    if (roleRows.length === 0) {
      throw new Error('Role not found');
    }

    if (roleRows[0].is_system) {
      throw new Error('System default roles cannot be deleted');
    }

    await new Promise((resolve, reject) => {
      db.query('DELETE FROM role_permissions WHERE role_key = ?', [roleKey], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.query('DELETE FROM roles WHERE role_key = ?', [roleKey], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    return true;
  }

  static async getUserPermissions(roleNameOrKey) {
    if (!roleNameOrKey) return {};

    const roles = await new Promise((resolve, reject) => {
      db.query('SELECT role_key FROM roles WHERE LOWER(role_key) = LOWER(?) OR LOWER(role_name) = LOWER(?)', [roleNameOrKey, roleNameOrKey], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    const key = roles.length > 0 ? roles[0].role_key : 'EMPLOYEE';
    const matrix = await this.getRolePermissions(key);

    const permObj = {};
    matrix.forEach(m => {
      permObj[m.module_key] = {
        view: m.can_view,
        create: m.can_create,
        edit: m.can_edit,
        delete: m.can_delete
      };
    });

    return permObj;
  }
}

module.exports = RbacService;
