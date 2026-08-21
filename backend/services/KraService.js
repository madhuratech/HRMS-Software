const Performance = require('../models/Performance');

class KraService {
  static async create(data, userId) {
<<<<<<< HEAD
    const sql = `
      INSERT INTO kras (
        kra_title, department_id, role_id, weightage, status, description, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.kra_title, data.department_id, data.role_id, data.weightage || null,
=======
    const kraTitle = data.kra_title || data.title || 'Key Result Area';
    const sql = `
      INSERT INTO kras (
        kra_title, title, department_id, role_id, weightage, status, description, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      kraTitle, kraTitle, data.department_id || null, data.role_id || 'All Roles', data.weightage || null,
>>>>>>> origin/main
      data.status || 'Active', data.description || null, userId, userId
    ];
    await Performance.beginTransaction();
    try {
      const result = await Performance.query(sql, params);
      await Performance.commit();
      return { id: result.insertId };
    } catch (e) {
      await Performance.rollback();
      throw e;
    }
  }

  static async update(id, data, userId) {
<<<<<<< HEAD
    const sql = `
      UPDATE kras SET
        kra_title = ?, department_id = ?, role_id = ?, weightage = ?,
=======
    const kraTitle = data.kra_title || data.title || 'Key Result Area';
    const sql = `
      UPDATE kras SET
        kra_title = ?, title = ?, department_id = ?, role_id = ?, weightage = ?,
>>>>>>> origin/main
        status = ?, description = ?, updated_by = ?
      WHERE id = ?
    `;
    const params = [
<<<<<<< HEAD
      data.kra_title, data.department_id, data.role_id, data.weightage || null,
=======
      kraTitle, kraTitle, data.department_id || null, data.role_id || 'All Roles', data.weightage || null,
>>>>>>> origin/main
      data.status, data.description || null, userId, id
    ];
    await Performance.beginTransaction();
    try {
      await Performance.query(sql, params);
      await Performance.commit();
      return true;
    } catch (e) {
      await Performance.rollback();
      throw e;
    }
  }

  static async delete(id) {
    await Performance.beginTransaction();
    try {
      await Performance.query('DELETE FROM kras WHERE id = ?', [id]);
      await Performance.commit();
      return true;
    } catch (e) {
      await Performance.rollback();
      throw e;
    }
  }

  static async getById(id) {
    const rows = await Performance.query(
<<<<<<< HEAD
      `SELECT k.*, d.dept_name as department_name
=======
      `SELECT k.id,
              COALESCE(k.kra_title, k.title, 'Key Result Area') as kra_title,
              COALESCE(k.title, k.kra_title, 'Key Result Area') as title,
              k.department_id,
              COALESCE(d.dept_name, 'General') as department_name,
              COALESCE(k.role_id, 'All Roles') as role_id,
              k.weightage,
              k.description,
              COALESCE(k.status, 'Active') as status,
              k.created_at
>>>>>>> origin/main
       FROM kras k
       LEFT JOIN departments d ON k.department_id = d.id
       WHERE k.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async list(filters, pagination) {
    let sql = `
<<<<<<< HEAD
      SELECT k.*, d.dept_name as department_name
=======
      SELECT k.id,
             COALESCE(k.kra_title, k.title, 'Key Result Area') as kra_title,
             COALESCE(k.title, k.kra_title, 'Key Result Area') as title,
             k.department_id,
             COALESCE(d.dept_name, 'General') as department_name,
             COALESCE(k.role_id, 'All Roles') as role_id,
             k.weightage,
             k.description,
             COALESCE(k.status, 'Active') as status,
             k.created_at
>>>>>>> origin/main
      FROM kras k
      LEFT JOIN departments d ON k.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
<<<<<<< HEAD
      sql += ` AND (k.kra_title LIKE ? OR k.role_id LIKE ? OR k.status LIKE ?)`;
      const term = `%${filters.search}%`;
      params.push(term, term, term);
=======
      sql += ` AND (k.kra_title LIKE ? OR k.title LIKE ? OR k.role_id LIKE ? OR k.status LIKE ?)`;
      const term = `%${filters.search}%`;
      params.push(term, term, term, term);
>>>>>>> origin/main
    }
    if (filters.department_id) {
      sql += ` AND k.department_id = ?`;
      params.push(filters.department_id);
    }

    sql += ` ORDER BY k.created_at DESC`;

    if (pagination) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(pagination.limit, pagination.offset);
    }

    const rows = await Performance.query(sql, params);

    let countSql = `
      SELECT COUNT(*) as count
      FROM kras k
      WHERE 1=1
    `;
    const countParams = [];
    if (filters.search) {
      countSql += ` AND (k.kra_title LIKE ? OR k.role_id LIKE ? OR k.status LIKE ?)`;
      countParams.push(term, term, term);
    }
    if (filters.department_id) {
      countSql += ` AND k.department_id = ?`;
      countParams.push(filters.department_id);
    }

    const totalRes = await Performance.query(countSql, countParams);

    return { rows, total: totalRes[0].count };
  }

  static async getDashboardStats() {
    const total = await Performance.query('SELECT COUNT(*) as count FROM kras');
    const active = await Performance.query("SELECT COUNT(*) as count FROM kras WHERE status = 'Active'");
    const inactive = await Performance.query("SELECT COUNT(*) as count FROM kras WHERE status = 'Inactive'");

    const totalVal = total[0].count || 0;
    const activeVal = active[0].count || 0;
    const inactiveVal = inactive[0].count || 0;

    const rate = totalVal > 0 ? Math.round((activeVal / totalVal) * 100) : 0;

    const deptSummary = await Performance.query(`
      SELECT d.dept_name as name, COUNT(k.id) as kras
      FROM departments d
      JOIN kras k ON k.department_id = d.id
      GROUP BY d.dept_name
      LIMIT 6
    `);

    return {
      total: totalVal,
      active: activeVal,
      inactive: inactiveVal,
      rate: `${rate}%`,
      chartData: [
        { name: 'Active', value: activeVal, color: '#10B981' },
        { name: 'Inactive', value: inactiveVal, color: '#EF4444' }
      ],
      deptData: deptSummary
    };
  }
}

module.exports = KraService;
