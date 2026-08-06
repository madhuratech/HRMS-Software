const Performance = require('../models/Performance');

class GoalService {
  static async create(data, userId) {
    const sql = `
      INSERT INTO goals (
        employee_id, goal_title, goal_category, goal_description, priority,
        start_date, target_date, completion_percentage, status, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.employee_id, data.goal_title, data.goal_category || 'General', data.goal_description || null,
      data.priority || 'Medium', data.start_date || null, data.target_date, data.completion_percentage || 0,
      data.status || 'Not Started', userId, userId
    ];
    const result = await Performance.query(sql, params);
    return { id: result.insertId };
  }

  static async update(id, data, userId) {
    const sql = `
      UPDATE goals SET
        goal_title = ?, goal_category = ?, goal_description = ?, priority = ?,
        start_date = ?, target_date = ?, completion_percentage = ?, status = ?, updated_by = ?
      WHERE id = ?
    `;
    const params = [
      data.goal_title, data.goal_category || 'General', data.goal_description || null, data.priority || 'Medium',
      data.start_date || null, data.target_date, data.completion_percentage, data.status, userId, id
    ];
    await Performance.query(sql, params);
    return true;
  }

  static async delete(id) {
    await Performance.query('DELETE FROM goals WHERE id = ?', [id]);
    return true;
  }

  static async getById(id) {
    const rows = await Performance.query(
      `SELECT g.*, e.name as employee_name, b.branch_name as department_name
       FROM goals g
       LEFT JOIN employees e ON g.employee_id = e.id
       LEFT JOIN branches b ON e.branch_id = b.id
       WHERE g.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async list(filters, pagination) {
    let sql = `
      SELECT g.*, e.name as employee_name, b.branch_name as department_name
      FROM goals g
      LEFT JOIN employees e ON g.employee_id = e.id
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let term = null;

    if (filters.search) {
      term = `%${filters.search}%`;
      sql += ` AND (e.name LIKE ? OR g.goal_title LIKE ? OR g.status LIKE ?)`;
      params.push(term, term, term);
    }
    if (filters.branch_id) {
      sql += ` AND e.branch_id = ?`;
      params.push(filters.branch_id);
    }

    sql += ` ORDER BY g.created_at DESC`;

    if (pagination) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(pagination.limit, pagination.offset);
    }

    const rows = await Performance.query(sql, params);

    let countSql = `
      SELECT COUNT(*) as count
      FROM goals g
      LEFT JOIN employees e ON g.employee_id = e.id
      WHERE 1=1
    `;
    const countParams = [];
    if (term) {
      countSql += ` AND (e.name LIKE ? OR g.goal_title LIKE ? OR g.status LIKE ?)`;
      countParams.push(term, term, term);
    }
    if (filters.branch_id) {
      countSql += ` AND e.branch_id = ?`;
      countParams.push(filters.branch_id);
    }

    const totalRes = await Performance.query(countSql, countParams);

    return { rows, total: totalRes[0].count };
  }

  static async getDashboardStats() {
    const total = await Performance.query('SELECT COUNT(*) as count FROM goals');
    const completed = await Performance.query("SELECT COUNT(*) as count FROM goals WHERE status = 'Completed'");
    const inProgress = await Performance.query("SELECT COUNT(*) as count FROM goals WHERE status = 'On Track'");
    const pending = await Performance.query("SELECT COUNT(*) as count FROM goals WHERE status = 'Not Started'");
    const overdue = await Performance.query("SELECT COUNT(*) as count FROM goals WHERE status != 'Completed' AND target_date < CURDATE()");

    const totalVal = total[0].count || 0;
    const completedVal = completed[0].count || 0;
    const inProgressVal = inProgress[0].count || 0;
    const pendingVal = pending[0].count || 0;
    const overdueVal = overdue[0].count || 0;

    const rate = totalVal > 0 ? Math.round((completedVal / totalVal) * 100) : 0;

    // Use branches instead of departments (employees link to branch_id)
    const deptSummary = await Performance.query(`
      SELECT b.branch_name as name, COUNT(g.id) as goals
      FROM branches b
      JOIN employees e ON e.branch_id = b.id
      JOIN goals g ON g.employee_id = e.id
      GROUP BY b.id, b.branch_name
      LIMIT 6
    `);

    return {
      total: totalVal,
      completed: completedVal,
      inProgress: inProgressVal,
      pending: pendingVal,
      overdue: overdueVal,
      rate: `${rate}%`,
      chartData: [
        { name: 'On Track', value: inProgressVal, color: '#2563EB' },
        { name: 'At Risk', value: overdueVal, color: '#F59E0B' },
        { name: 'Not Started', value: pendingVal, color: '#CBD5E1' },
        { name: 'Completed', value: completedVal, color: '#22C55E' }
      ],
      deptData: deptSummary
    };
  }
}

module.exports = GoalService;
