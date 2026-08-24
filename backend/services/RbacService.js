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
  { key: 'helpdesk', label: 'Support & Helpdesk', category: 'Support' },
  { key: 'settings', label: 'Settings & Configurations', category: 'Administration' },
  { key: 'ai_assistant', label: 'AI Assistant', category: 'Tools' },
  { key: 'user_roles', label: 'User Roles & Permissions', category: 'Administration' }
];

const STANDARD_ROLE_KEYS = ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEADER', 'EMPLOYEE'];

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

    const standardRolesMap = {
      'SUPER_ADMIN': {
        role_key: 'SUPER_ADMIN',
        role_name: 'Admin',
        name: 'Admin',
        description: 'Full HRMS administrative access across all system modules and settings.',
        is_system: 1
      },
      'HR_MANAGER': {
        role_key: 'HR_MANAGER',
        role_name: 'HR',
        name: 'HR',
        description: 'HR management access for employees, recruitment, onboarding, and performance.',
        is_system: 1
      },
      'TEAM_LEADER': {
        role_key: 'TEAM_LEADER',
        role_name: 'Team Leader',
        name: 'Team Leader',
        description: 'Team management access for assigned team members, attendance, tasks, and reviews.',
        is_system: 1
      },
      'EMPLOYEE': {
        role_key: 'EMPLOYEE',
        role_name: 'Employee',
        name: 'Employee',
        description: 'Employee self-service portal for personal attendance, leave, payslips, and tasks.',
        is_system: 1
      }
    };

    const finalRoles = [];

    // 1. Add the 4 Standard System Roles
    for (const key of STANDARD_ROLE_KEYS) {
      const dbMatch = roles.find(r => (r.role_key || '').toUpperCase() === key);
      const stdRole = standardRolesMap[key];
      finalRoles.push({
        id: dbMatch ? dbMatch.id : (key === 'SUPER_ADMIN' ? 1 : key === 'HR_MANAGER' ? 20 : key === 'TEAM_LEADER' ? 19 : 12),
        role_key: key,
        role_name: stdRole.role_name,
        name: stdRole.name,
        description: stdRole.description,
        is_system: 1,
        user_count: dbMatch ? dbMatch.user_count : 0
      });
    }

    // 2. Add Custom Roles created by Admin (is_system = 0)
    const customRoles = roles.filter(r => !r.is_system && !STANDARD_ROLE_KEYS.includes((r.role_key || '').toUpperCase()));
    for (const r of customRoles) {
      const roleKey = (r.role_key || r.name || `ROLE_${r.id}`).toUpperCase();
      finalRoles.push({
        ...r,
        role_key: roleKey,
        role_name: r.role_name || r.name || `Role ${r.id}`,
        description: r.description || `Custom role permissions for ${r.role_name || r.name}.`,
        is_system: 0
      });
    }

    return finalRoles;
  }

  static async getRolePermissions(roleKey) {
    const keyUpper = (roleKey || 'EMPLOYEE').toUpperCase();
    const permissions = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM role_permissions WHERE UPPER(role_key) = ?`;
      db.query(sql, [keyUpper], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    const permMap = {};
    permissions.forEach(p => {
      permMap[p.module_key] = {
        can_view: Boolean(p.can_view),
        can_create: Boolean(p.can_create),
        can_edit: Boolean(p.can_edit),
        can_delete: Boolean(p.can_delete)
      };
    });

    const getDefaultView = (mKey) => {
      if (keyUpper === 'SUPER_ADMIN' || keyUpper === 'ADMIN') return true;
      if (keyUpper === 'HR_MANAGER' || keyUpper === 'HR') {
        return ['dashboard', 'organization', 'employees', 'attendance', 'leave', 'recruitment', 'onboarding', 'performance', 'reports', 'documents', 'helpdesk'].includes(mKey);
      }
      if (keyUpper === 'TEAM_LEADER') {
        return ['dashboard', 'employees', 'attendance', 'leave', 'projects', 'performance', 'reports', 'documents', 'helpdesk'].includes(mKey);
      }
      if (keyUpper === 'EMPLOYEE') {
        return ['dashboard', 'employees', 'attendance', 'leave', 'payroll', 'projects', 'performance', 'documents', 'helpdesk'].includes(mKey);
      }
      return true;
    };

    const fullMatrix = MODULE_LIST.map(m => ({
      module_key: m.key,
      module_label: m.label,
      category: m.category,
      can_view: permMap[m.key] ? permMap[m.key].can_view : getDefaultView(m.key),
      can_create: permMap[m.key] ? permMap[m.key].can_create : (keyUpper === 'SUPER_ADMIN' || keyUpper === 'ADMIN'),
      can_edit: permMap[m.key] ? permMap[m.key].can_edit : (keyUpper === 'SUPER_ADMIN' || keyUpper === 'ADMIN'),
      can_delete: permMap[m.key] ? permMap[m.key].can_delete : (keyUpper === 'SUPER_ADMIN' || keyUpper === 'ADMIN')
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
      db.query('SELECT id FROM roles WHERE UPPER(role_key) = ? OR LOWER(role_name) = LOWER(?)', [roleKey, role_name.trim()], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    if (existing.length > 0) {
      throw new Error('A role with this name already exists');
    }

    // Insert custom role
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
    const keyUpper = (roleKey || '').toUpperCase();

    if (roleInfo && roleInfo.role_name) {
      await new Promise((resolve, reject) => {
        const sql = 'UPDATE roles SET role_name = ?, description = ? WHERE UPPER(role_key) = ?';
        db.query(sql, [roleInfo.role_name, roleInfo.description || '', keyUpper], (err) => {
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
            keyUpper,
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
    const keyUpper = (roleKey || '').toUpperCase();
    if (STANDARD_ROLE_KEYS.includes(keyUpper)) {
      throw new Error('Standard system roles cannot be deleted');
    }

    const roleRows = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM roles WHERE UPPER(role_key) = ?', [keyUpper], (err, rows) => {
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
      db.query('DELETE FROM role_permissions WHERE UPPER(role_key) = ?', [keyUpper], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.query('DELETE FROM roles WHERE UPPER(role_key) = ?', [keyUpper], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    return true;
  }

  static async getUserPermissions(roleNameOrKey) {
    if (!roleNameOrKey) return {};
    const inputUpper = roleNameOrKey.trim().toUpperCase();

    // Map input to standard role key if matched
    let resolvedKey = inputUpper;
    if (inputUpper === 'ADMIN' || inputUpper === 'SUPER_ADMIN' || inputUpper === 'SUPER ADMIN') {
      resolvedKey = 'SUPER_ADMIN';
    } else if (inputUpper === 'HR' || inputUpper === 'HR_MANAGER' || inputUpper === 'HR MANAGER') {
      resolvedKey = 'HR_MANAGER';
    } else if (inputUpper === 'TEAM_LEADER' || inputUpper === 'TEAM LEADER') {
      resolvedKey = 'TEAM_LEADER';
    } else if (inputUpper === 'EMPLOYEE') {
      resolvedKey = 'EMPLOYEE';
    } else {
      const roles = await new Promise((resolve, reject) => {
        db.query('SELECT role_key FROM roles WHERE UPPER(role_key) = ? OR LOWER(role_name) = LOWER(?)', [inputUpper, roleNameOrKey.trim()], (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
      resolvedKey = roles.length > 0 ? roles[0].role_key : 'EMPLOYEE';
    }

    const matrix = await this.getRolePermissions(resolvedKey);

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
