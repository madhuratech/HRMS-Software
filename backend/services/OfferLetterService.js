const OfferLetter = require('../models/OfferLetter');

class OfferLetterService {
  static async create(data, userId) {
    const sql = `
      INSERT INTO offer_letters (
        candidate_name, job_position, department_id, salary_offered, joining_date,
        reporting_manager, employment_type, offer_expiry_date, notes, status,
        created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.candidate_name, data.job_position, data.department_id, data.salary_offered, data.joining_date,
      data.reporting_manager, data.employment_type || 'Full-time', data.offer_expiry_date, data.notes || null, data.status || 'Pending',
      userId, userId
    ];

    await OfferLetter.beginTransaction();
    try {
      const result = await OfferLetter.query(sql, params);
      await OfferLetter.commit();
      return { id: result.insertId };
    } catch (error) {
      await OfferLetter.rollback();
      throw error;
    }
  }

  static async update(id, data, userId) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Offer letter not found');

    const sql = `
      UPDATE offer_letters SET
        candidate_name = ?, job_position = ?, department_id = ?, salary_offered = ?, joining_date = ?,
        reporting_manager = ?, employment_type = ?, offer_expiry_date = ?, notes = ?, status = ?,
        updated_by = ?
      WHERE id = ?
    `;

    const params = [
      data.candidate_name, data.job_position, data.department_id, data.salary_offered, data.joining_date,
      data.reporting_manager, data.employment_type, data.offer_expiry_date, data.notes || null, data.status,
      userId, id
    ];

    await OfferLetter.beginTransaction();
    try {
      await OfferLetter.query(sql, params);
      await OfferLetter.commit();
      return true;
    } catch (error) {
      await OfferLetter.rollback();
      throw error;
    }
  }

  static async delete(id) {
    await OfferLetter.beginTransaction();
    try {
      await OfferLetter.query('DELETE FROM offer_letters WHERE id = ?', [id]);
      await OfferLetter.commit();
      return true;
    } catch (error) {
      await OfferLetter.rollback();
      throw error;
    }
  }

  static async getById(id) {
    const rows = await OfferLetter.query(
      `SELECT o.*, d.dept_name as department_name
       FROM offer_letters o
       LEFT JOIN departments d ON o.department_id = d.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async list(filters, pagination) {
    let sql = `
      SELECT o.*, d.dept_name as department_name
      FROM offer_letters o
      LEFT JOIN departments d ON o.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    // Search
    if (filters.search) {
      sql += ` AND (o.candidate_name LIKE ? OR o.job_position LIKE ? OR o.reporting_manager LIKE ? OR o.status LIKE ?)`;
      const term = `%${filters.search}%`;
      params.push(term, term, term, term);
    }

    // Filters
    if (filters.department_id) {
      sql += ` AND o.department_id = ?`;
      params.push(filters.department_id);
    }
    if (filters.status) {
      sql += ` AND o.status = ?`;
      params.push(filters.status);
    }

    sql += ` ORDER BY o.created_at DESC`;

    if (pagination) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(pagination.limit, pagination.offset);
    }

    const rows = await OfferLetter.query(sql, params);

    // Count
    let countSql = `
      SELECT COUNT(*) as count
      FROM offer_letters o
      LEFT JOIN departments d ON o.department_id = d.id
      WHERE 1=1
    `;
    const countParams = [];
    if (filters.search) {
      countSql += ` AND (o.candidate_name LIKE ? OR o.job_position LIKE ? OR o.reporting_manager LIKE ? OR o.status LIKE ?)`;
      countParams.push(term, term, term, term);
    }
    if (filters.department_id) {
      countSql += ` AND o.department_id = ?`;
      countParams.push(filters.department_id);
    }
    if (filters.status) {
      countSql += ` AND o.status = ?`;
      countParams.push(filters.status);
    }

    const totalResult = await OfferLetter.query(countSql, countParams);
    return {
      rows,
      total: totalResult[0].count
    };
  }
}

module.exports = OfferLetterService;
