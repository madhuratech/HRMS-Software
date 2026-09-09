const Performance = require('../models/Performance');

class KpiService {
  static async create(data, userId) {
    const kpiName = data.kpi_name || data.title || 'KPI Target';
    const sql = `
      INSERT INTO kpis (
        kra_id, kpi_name, title, department_id, measurement_type, weightage, target_value, description, status, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.kra_id || null, kpiName, kpiName, data.department_id || null, data.measurement_type || 'Percentage',
      data.weightage !== undefined && data.weightage !== null && data.weightage !== '' ? Number(data.weightage) : null,
      data.target_value, data.description || null, data.status || 'Active', userId, userId
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
    const kpiName = data.kpi_name || data.title || 'KPI Target';
    const sql = `
      UPDATE kpis SET
        kra_id = ?, kpi_name = ?, title = ?, department_id = ?, measurement_type = ?, weightage = ?, target_value = ?,
        description = ?, status = ?, updated_by = ?
      WHERE id = ?
    `;
    const params = [
      data.kra_id || null, kpiName, kpiName, data.department_id || null, data.measurement_type || 'Percentage',
      data.weightage !== undefined && data.weightage !== null && data.weightage !== '' ? Number(data.weightage) : null,
      data.target_value, data.description || null, data.status, userId, id
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
      `SELECT k.id,
              k.kra_id,
              COALESCE(kr.kra_title, kr.title, 'General KRA') as kra_title,
              kr.goal_id,
              COALESCE(g.goal_title, g.title, 'General Goal') as goal_title,
              COALESCE(k.kpi_name, k.title, 'KPI Target') as kpi_name,
              COALESCE(k.title, k.kpi_name, 'KPI Target') as title,
              k.department_id,
              COALESCE(d.dept_name, 'General') as department_name,
              COALESCE(k.measurement_type, 'Percentage') as measurement_type,
              k.weightage,
              k.target_value,
              k.achieved_value,
              k.description,
              COALESCE(k.status, 'Active') as status,
              k.created_at
       FROM kpis k
       LEFT JOIN kras kr ON k.kra_id = kr.id
       LEFT JOIN goals g ON kr.goal_id = g.id
       LEFT JOIN departments d ON k.department_id = d.id
       WHERE k.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async list(filters = {}, pagination = null) {
    let sql = `
      SELECT k.id,
             k.kra_id,
             COALESCE(kr.kra_title, kr.title, 'General KRA') as kra_title,
             kr.goal_id,
             COALESCE(g.goal_title, g.title, 'General Goal') as goal_title,
             COALESCE(k.kpi_name, k.title, 'KPI Target') as kpi_name,
             COALESCE(k.title, k.kpi_name, 'KPI Target') as title,
             k.department_id,
             COALESCE(d.dept_name, 'General') as department_name,
             COALESCE(k.measurement_type, 'Percentage') as measurement_type,
             k.weightage,
             k.target_value,
             k.achieved_value,
             k.description,
             COALESCE(k.status, 'Active') as status,
             k.created_at
      FROM kpis k
      LEFT JOIN kras kr ON k.kra_id = kr.id
      LEFT JOIN goals g ON kr.goal_id = g.id
      LEFT JOIN departments d ON k.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
      sql += ` AND (k.kpi_name LIKE ? OR k.title LIKE ? OR k.status LIKE ? OR kr.kra_title LIKE ?)`;
      const term = `%${filters.search}%`;
      params.push(term, term, term, term);
    }
    if (filters.department_id) {
      sql += ` AND k.department_id = ?`;
      params.push(filters.department_id);
    }
    if (filters.kra_id) {
      sql += ` AND k.kra_id = ?`;
      params.push(filters.kra_id);
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
      LEFT JOIN kras kr ON k.kra_id = kr.id
      WHERE 1=1
    `;
    const countParams = [];
    if (filters.search) {
      const term = `%${filters.search}%`;
      countSql += ` AND (k.kpi_name LIKE ? OR k.title LIKE ? OR k.status LIKE ? OR kr.kra_title LIKE ?)`;
      countParams.push(term, term, term, term);
    }
    if (filters.department_id) {
      countSql += ` AND k.department_id = ?`;
      countParams.push(filters.department_id);
    }
    if (filters.kra_id) {
      countSql += ` AND k.kra_id = ?`;
      countParams.push(filters.kra_id);
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
