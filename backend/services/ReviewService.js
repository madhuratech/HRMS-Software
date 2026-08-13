const Performance = require('../models/Performance');

class ReviewService {
  static async create(data, userId) {
    const sql = `
      INSERT INTO reviews (
        employee_id, review_period, reviewer_id, type, overall_rating,
        strengths, improvement, goals, comments, status, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.employee_id, data.review_period, data.reviewer_id, data.type, data.overall_rating || '5',
      data.strengths || null, data.improvement || null, data.goals || null, data.comments || null,
      data.status || 'In Progress', userId, userId
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
    const sql = `
      UPDATE reviews SET
        review_period = ?, reviewer_id = ?, type = ?, overall_rating = ?,
        strengths = ?, improvement = ?, goals = ?, comments = ?, status = ?, updated_by = ?
      WHERE id = ?
    `;
    const params = [
      data.review_period, data.reviewer_id, data.type, data.overall_rating,
      data.strengths || null, data.improvement || null, data.goals || null, data.comments || null,
      data.status, userId, id
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
      await Performance.query('DELETE FROM reviews WHERE id = ?', [id]);
      await Performance.commit();
      return true;
    } catch (e) {
      await Performance.rollback();
      throw e;
    }
  }

  static async getById(id) {
    const rows = await Performance.query(
      `SELECT r.*, e.name as employee_name, d.dept_name as department_name
       FROM reviews r
       LEFT JOIN employees e ON r.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async list(filters, pagination) {
    let sql = `
      SELECT r.*, e.name as employee_name, d.dept_name as department_name
      FROM reviews r
      LEFT JOIN employees e ON r.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
      sql += ` AND (e.name LIKE ? OR r.reviewer_id LIKE ? OR r.status LIKE ?)`;
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }
    if (filters.department_id) {
      sql += ` AND e.department_id = ?`;
      params.push(filters.department_id);
    }

    sql += ` ORDER BY r.created_at DESC`;

    if (pagination) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(pagination.limit, pagination.offset);
    }

    const rows = await Performance.query(sql, params);

    let countSql = `
      SELECT COUNT(*) as count
      FROM reviews r
      LEFT JOIN employees e ON r.employee_id = e.id
      WHERE 1=1
    `;
    const countParams = [];
    if (filters.search) {
      countSql += ` AND (e.name LIKE ? OR r.reviewer_id LIKE ? OR r.status LIKE ?)`;
      countParams.push(term, term, term);
    }
    if (filters.department_id) {
      countSql += ` AND e.department_id = ?`;
      countParams.push(filters.department_id);
    }

    const totalRes = await Performance.query(countSql, countParams);

    return { rows, total: totalRes[0].count };
  }

  static async getDashboardStats() {
    const total = await Performance.query('SELECT COUNT(*) as count FROM reviews');
    const completed = await Performance.query("SELECT COUNT(*) as count FROM reviews WHERE status = 'Completed'");
    const inProgress = await Performance.query("SELECT COUNT(*) as count FROM reviews WHERE status = 'In Progress'");
    const pending = await Performance.query("SELECT COUNT(*) as count FROM reviews WHERE status = 'Pending'");

    const totalVal = total[0].count || 0;
    const completedVal = completed[0].count || 0;
    const inProgressVal = inProgress[0].count || 0;
    const pendingVal = pending[0].count || 0;

    const rate = totalVal > 0 ? Math.round((completedVal / totalVal) * 100) : 0;

    return {
      total: totalVal,
      completed: completedVal,
      inProgress: inProgressVal,
      pending: pendingVal,
      rate: `${rate}%`,
      chartData: [
        { name: 'Completed', value: completedVal, color: '#10B981' },
        { name: 'In Progress', value: inProgressVal, color: '#2952E3' },
        { name: 'Pending', value: pendingVal, color: '#F59E0B' }
      ]
    };
  }
}

module.exports = ReviewService;
