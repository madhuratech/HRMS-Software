const Candidate = require('../models/Candidate');

class CandidateService {
  static async create(data, userId) {
    // Check if email already exists
    const existing = await Candidate.query('SELECT id FROM candidates WHERE email = ?', [data.email]);
    if (existing.length > 0) {
      throw new Error('Email address already registered');
    }

    const sql = `
      INSERT INTO candidates (
        candidate_name, email, mobile_number, gender, department_id, job_position,
        date_of_birth, resume, experience, current_company, current_salary, expected_salary,
        notice_period, skills, address, status, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.candidate_name, data.email, data.mobile_number, data.gender || 'Male', data.department_id, data.job_position,
      data.date_of_birth || null, data.resume || null, data.experience || null, data.current_company || null,
      data.current_salary || null, data.expected_salary || null, data.notice_period || null, data.skills || null,
      data.address || null, data.status || 'Applied', userId, userId
    ];

    await Candidate.beginTransaction();
    try {
      const result = await Candidate.query(sql, params);
      await Candidate.commit();
      return { id: result.insertId };
    } catch (error) {
      await Candidate.rollback();
      throw error;
    }
  }

  static async update(id, data, userId) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Candidate not found');

    // Check if email is being updated and already exists elsewhere
    if (data.email && data.email !== existing.email) {
      const other = await Candidate.query('SELECT id FROM candidates WHERE email = ? AND id != ?', [data.email, id]);
      if (other.length > 0) {
        throw new Error('Email address already registered');
      }
    }

    const candidate_name = data.candidate_name !== undefined ? data.candidate_name : existing.candidate_name;
    const email = data.email !== undefined ? data.email : existing.email;
    const mobile_number = data.mobile_number !== undefined ? data.mobile_number : existing.mobile_number;
    const gender = data.gender !== undefined ? data.gender : existing.gender;
    const department_id = data.department_id !== undefined ? data.department_id : existing.department_id;
    const job_position = data.job_position !== undefined ? data.job_position : existing.job_position;
    const date_of_birth = data.date_of_birth !== undefined ? data.date_of_birth : existing.date_of_birth;
    const resume = data.resume !== undefined ? data.resume : existing.resume;
    const experience = data.experience !== undefined ? data.experience : existing.experience;
    const current_company = data.current_company !== undefined ? data.current_company : existing.current_company;
    const current_salary = data.current_salary !== undefined ? data.current_salary : existing.current_salary;
    const expected_salary = data.expected_salary !== undefined ? data.expected_salary : existing.expected_salary;
    const notice_period = data.notice_period !== undefined ? data.notice_period : existing.notice_period;
    const skills = data.skills !== undefined ? data.skills : existing.skills;
    const address = data.address !== undefined ? data.address : existing.address;
    const status = data.status !== undefined ? data.status : existing.status;

    const sql = `
      UPDATE candidates SET
        candidate_name = ?, email = ?, mobile_number = ?, gender = ?, department_id = ?, job_position = ?,
        date_of_birth = ?, resume = ?, experience = ?, current_company = ?,
        current_salary = ?, expected_salary = ?, notice_period = ?, skills = ?, address = ?,
        status = ?, updated_by = ?
      WHERE id = ?
    `;

    const params = [
      candidate_name, email, mobile_number, gender, department_id, job_position,
      date_of_birth, resume, experience, current_company,
      current_salary, expected_salary, notice_period, skills, address,
      status, userId, id
    ];

    await Candidate.beginTransaction();
    try {
      await Candidate.query(sql, params);
      await Candidate.commit();
      return true;
    } catch (error) {
      await Candidate.rollback();
      throw error;
    }
  }

  static async delete(id) {
    await Candidate.beginTransaction();
    try {
      await Candidate.query('DELETE FROM candidates WHERE id = ?', [id]);
      await Candidate.commit();
      return true;
    } catch (error) {
      await Candidate.rollback();
      throw error;
    }
  }

  static async getById(id) {
    const rows = await Candidate.query(
      `SELECT c.*, d.dept_name as department_name
       FROM candidates c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async list(filters, pagination) {
    let sql = `
      SELECT c.*, d.dept_name as department_name
      FROM candidates c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    // Search
    if (filters.search) {
      sql += ` AND (c.candidate_name LIKE ? OR c.email LIKE ? OR c.mobile_number LIKE ? OR c.job_position LIKE ? OR d.dept_name LIKE ? OR c.status LIKE ?)`;
      const term = `%${filters.search}%`;
      params.push(term, term, term, term, term, term);
    }

    // Filters
    if (filters.department_id) {
      sql += ` AND c.department_id = ?`;
      params.push(filters.department_id);
    }
    if (filters.status) {
      sql += ` AND c.status = ?`;
      params.push(filters.status);
    }
    if (filters.gender) {
      sql += ` AND c.gender = ?`;
      params.push(filters.gender);
    }
    if (filters.experience) {
      sql += ` AND c.experience = ?`;
      params.push(filters.experience);
    }
    if (filters.has_resume !== undefined) {
      if (filters.has_resume === 'true' || filters.has_resume === true) {
        sql += ` AND c.resume IS NOT NULL AND c.resume != ''`;
      } else {
        sql += ` AND (c.resume IS NULL OR c.resume = '')`;
      }
    }

    // Sorting
    sql += ` ORDER BY c.created_at DESC`;

    // Pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(pagination.limit, pagination.offset);

    const rows = await Candidate.query(sql, params);
    
    // Count query
    let countSql = `
      SELECT COUNT(*) as count
      FROM candidates c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE 1=1
    `;
    const countParams = [];
    if (filters.search) {
      countSql += ` AND (c.candidate_name LIKE ? OR c.email LIKE ? OR c.mobile_number LIKE ? OR c.job_position LIKE ? OR d.dept_name LIKE ? OR c.status LIKE ?)`;
      countParams.push(term, term, term, term, term, term);
    }
    if (filters.department_id) {
      countSql += ` AND c.department_id = ?`;
      countParams.push(filters.department_id);
    }
    if (filters.status) {
      countSql += ` AND c.status = ?`;
      countParams.push(filters.status);
    }
    if (filters.gender) {
      countSql += ` AND c.gender = ?`;
      countParams.push(filters.gender);
    }
    if (filters.experience) {
      countSql += ` AND c.experience = ?`;
      countParams.push(filters.experience);
    }
    if (filters.has_resume !== undefined) {
      if (filters.has_resume === 'true' || filters.has_resume === true) {
        countSql += ` AND c.resume IS NOT NULL AND c.resume != ''`;
      } else {
        countSql += ` AND (c.resume IS NULL OR c.resume = '')`;
      }
    }

    const totalResult = await Candidate.query(countSql, countParams);
    return {
      rows,
      total: totalResult[0].count
    };
  }

  static async dropdown() {
    const rows = await Candidate.query('SELECT id, candidate_name as name, email, job_position FROM candidates ORDER BY candidate_name ASC');
    return rows;
  }
}

module.exports = CandidateService;
