const NewJoiner = require('../models/NewJoiner');

class NewJoinerService {
  static async create(data, userId) {
    const sql = `
      INSERT INTO new_joiners (
        employee_name, department_id, designation, joining_date,
        reporting_manager, checklist, buddy, status, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.employee_name, data.department_id, data.designation, data.joining_date,
      data.reporting_manager, data.checklist, data.buddy || null, data.status || 'In Progress',
      userId, userId
    ];

    await NewJoiner.beginTransaction();
    try {
      const result = await NewJoiner.query(sql, params);
      await NewJoiner.commit();
      return { id: result.insertId };
    } catch (error) {
      await NewJoiner.rollback();
      throw error;
    }
  }

  static async update(id, data, userId) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('New Joiner onboarding record not found');

    const sql = `
      UPDATE new_joiners SET
        employee_name = ?, department_id = ?, designation = ?, joining_date = ?,
        reporting_manager = ?, checklist = ?, buddy = ?, status = ?, updated_by = ?
      WHERE id = ?
    `;

    const params = [
      data.employee_name, data.department_id, data.designation, data.joining_date,
      data.reporting_manager, data.checklist, data.buddy || null, data.status,
      userId, id
    ];

    await NewJoiner.beginTransaction();
    try {
      await NewJoiner.query(sql, params);
      await NewJoiner.commit();
      return true;
    } catch (error) {
      await NewJoiner.rollback();
      throw error;
    }
  }

  static async delete(id) {
    await NewJoiner.beginTransaction();
    try {
      await NewJoiner.query('DELETE FROM new_joiners WHERE id = ?', [id]);
      await NewJoiner.commit();
      return true;
    } catch (error) {
      await NewJoiner.rollback();
      throw error;
    }
  }

  static async getById(id) {
    const rows = await NewJoiner.query(
      `SELECT n.*, d.dept_name as department_name
       FROM new_joiners n
       LEFT JOIN departments d ON n.department_id = d.id
       WHERE n.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async list(filters, pagination) {
    let sql = `
      SELECT n.*, d.dept_name as department_name
      FROM new_joiners n
      LEFT JOIN departments d ON n.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    // Search
    if (filters.search) {
      sql += ` AND (n.employee_name LIKE ? OR n.designation LIKE ? OR n.reporting_manager LIKE ? OR n.status LIKE ?)`;
      const term = `%${filters.search}%`;
      params.push(term, term, term, term);
    }

    // Filters
    if (filters.department_id) {
      sql += ` AND n.department_id = ?`;
      params.push(filters.department_id);
    }
    if (filters.status) {
      sql += ` AND n.status = ?`;
      params.push(filters.status);
    }

    sql += ` ORDER BY n.created_at DESC`;

    if (pagination) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(pagination.limit, pagination.offset);
    }

    const rows = await NewJoiner.query(sql, params);

    // Count
    let countSql = `
      SELECT COUNT(*) as count
      FROM new_joiners n
      LEFT JOIN departments d ON n.department_id = d.id
      WHERE 1=1
    `;
    const countParams = [];
    if (filters.search) {
      countSql += ` AND (n.employee_name LIKE ? OR n.designation LIKE ? OR n.reporting_manager LIKE ? OR n.status LIKE ?)`;
      countParams.push(term, term, term, term);
    }
    if (filters.department_id) {
      countSql += ` AND n.department_id = ?`;
      countParams.push(filters.department_id);
    }
    if (filters.status) {
      countSql += ` AND n.status = ?`;
      countParams.push(filters.status);
    }

    const totalResult = await NewJoiner.query(countSql, countParams);
    return {
      rows,
      total: totalResult[0].count
    };
  }

  static async getDashboardStats() {
    // 1. KPI stats
    const totalCount = await NewJoiner.query(`SELECT COUNT(*) as count FROM new_joiners`);
    const weekCount = await NewJoiner.query(`SELECT COUNT(*) as count FROM new_joiners WHERE YEARWEEK(joining_date, 1) = YEARWEEK(CURDATE(), 1)`);
    const pendingCount = await NewJoiner.query(`SELECT COUNT(*) as count FROM new_joiners WHERE status = 'Pending'`);
    const inProgressCount = await NewJoiner.query(`SELECT COUNT(*) as count FROM new_joiners WHERE status = 'In Progress'`);
    const completedCount = await NewJoiner.query(`SELECT COUNT(*) as count FROM new_joiners WHERE status = 'Completed'`);

    const total = totalCount[0].count || 0;
    const completed = completedCount[0].count || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 2. Department-wise count
    const deptSummary = await NewJoiner.query(`
      SELECT d.dept_name as name, COUNT(n.id) as count
      FROM departments d
      JOIN new_joiners n ON n.department_id = d.id
      GROUP BY d.dept_name
      ORDER BY count DESC
      LIMIT 6
    `);

    return {
      total,
      joinedThisWeek: weekCount[0].count || 0,
      pending: pendingCount[0].count || 0,
      inProgress: inProgressCount[0].count || 0,
      completed,
      completionRate: `${completionRate}%`,
      chartData: [
        { name: 'Completed', value: completed, color: '#10B981' },
        { name: 'In Progress', value: inProgressCount[0].count || 0, color: '#2952E3' },
        { name: 'Pending', value: pendingCount[0].count || 0, color: '#F59E0B' }
      ],
      deptData: deptSummary
    };
  }
}

module.exports = NewJoinerService;
