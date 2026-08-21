const Performance = require('../models/Performance');

class KpiService {
  static async create(data, userId) {
<<<<<<< HEAD
    const sql = `
      INSERT INTO kpis (
        kpi_name, department_id, weightage, target_value, description, status, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.kpi_name, data.department_id, data.weightage || null, data.target_value,
=======
    const kpiName = data.kpi_name || data.title || 'KPI Target';
    const sql = `
      INSERT INTO kpis (
        kpi_name, title, department_id, weightage, target_value, description, status, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      kpiName, kpiName, data.department_id || null, data.weightage || null, data.target_value,
>>>>>>> origin/main
      data.description || null, data.status || 'Active', userId, userId
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
      UPDATE kpis SET
        kpi_name = ?, department_id = ?, weightage = ?, target_value = ?,
=======
    const kpiName = data.kpi_name || data.title || 'KPI Target';
    const sql = `
      UPDATE kpis SET
        kpi_name = ?, title = ?, department_id = ?, weightage = ?, target_value = ?,
>>>>>>> origin/main
        description = ?, status = ?, updated_by = ?
      WHERE id = ?
    `;
    const params = [
<<<<<<< HEAD
      data.kpi_name, data.department_id, data.weightage || null, data.target_value,
=======
      kpiName, kpiName, data.department_id || null, data.weightage || null, data.target_value,
>>>>>>> origin/main
      data.description || null, data.status, userId, id
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
      await Performance.query('DELETE FROM kpis WHERE id = ?', [id]);
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
              COALESCE(k.kpi_name, k.title, 'KPI Target') as kpi_name,
              COALESCE(k.title, k.kpi_name, 'KPI Target') as title,
              k.department_id,
              COALESCE(d.dept_name, 'General') as department_name,
              k.weightage,
              k.target_value,
              k.achieved_value,
              k.description,
              COALESCE(k.status, 'Active') as status,
              k.created_at
>>>>>>> origin/main
       FROM kpis k
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
             COALESCE(k.kpi_name, k.title, 'KPI Target') as kpi_name,
             COALESCE(k.title, k.kpi_name, 'KPI Target') as title,
             k.department_id,
             COALESCE(d.dept_name, 'General') as department_name,
             k.weightage,
             k.target_value,
             k.achieved_value,
             k.description,
             COALESCE(k.status, 'Active') as status,
             k.created_at
>>>>>>> origin/main
      FROM kpis k
      LEFT JOIN departments d ON k.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
<<<<<<< HEAD
      sql += ` AND (k.kpi_name LIKE ? OR k.status LIKE ?)`;
      const term = `%${filters.search}%`;
      params.push(term, term);
=======
      sql += ` AND (k.kpi_name LIKE ? OR k.title LIKE ? OR k.status LIKE ?)`;
      const term = `%${filters.search}%`;
      params.push(term, term, term);
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
      FROM kpis k
      WHERE 1=1
    `;
    const countParams = [];
    if (filters.search) {
      countSql += ` AND (k.kpi_name LIKE ? OR k.status LIKE ?)`;
      countParams.push(term, term);
    }
    if (filters.department_id) {
      countSql += ` AND k.department_id = ?`;
      countParams.push(filters.department_id);
    }

    const totalRes = await Performance.query(countSql, countParams);

    return { rows, total: totalRes[0].count };
  }

  static async getDashboardStats() {
    const total = await Performance.query('SELECT COUNT(*) as count FROM kpis');
    const active = await Performance.query("SELECT COUNT(*) as count FROM kpis WHERE status = 'Active'");
    const inactive = await Performance.query("SELECT COUNT(*) as count FROM kpis WHERE status = 'Inactive'");

    const totalVal = total[0].count || 0;
    const activeVal = active[0].count || 0;
    const inactiveVal = inactive[0].count || 0;

    const rate = totalVal > 0 ? Math.round((activeVal / totalVal) * 100) : 0;

    const deptSummary = await Performance.query(`
      SELECT d.dept_name as name, COUNT(k.id) as count
      FROM departments d
      JOIN kpis k ON k.department_id = d.id
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

module.exports = KpiService;
