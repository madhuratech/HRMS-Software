const db = require('../config/database');
const response = require('../utils/response');

// Helper to generate URL-safe slugs for jobs
function createSlug(title, id) {
  const cleanTitle = String(title || 'job')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  return `${cleanTitle}-${id}`;
}

class PublicJobsController {
  
  // GET /api/public/jobs - List published active jobs
  static async listJobs(req, res) {
    try {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const { search, department, employment_type, location } = req.query;

      let sql = `
        SELECT r.*, d.dept_name as department_name
        FROM requirements r
        LEFT JOIN departments d ON d.id = r.department_id
        WHERE (LOWER(r.status) IN ('published', 'open', 'approved'))
          AND r.deleted_at IS NULL
          AND LOWER(r.status) NOT IN ('closed', 'draft', 'archived', 'deleted')
          AND (r.closing_date IS NULL OR r.closing_date >= CURRENT_DATE())
      `;

      const params = [];

      if (search) {
        sql += ` AND (LOWER(r.job_title) LIKE ? OR LOWER(r.skills) LIKE ? OR LOWER(r.job_description) LIKE ?)`;
        const term = `%${search.toLowerCase()}%`;
        params.push(term, term, term);
      }

      if (department) {
        sql += ` AND (LOWER(d.dept_name) = ? OR r.department_id = ?)`;
        params.push(department.toLowerCase(), parseInt(department, 10) || 0);
      }

      if (employment_type) {
        sql += ` AND LOWER(r.employment_type) = ?`;
        params.push(employment_type.toLowerCase());
      }

      if (location) {
        sql += ` AND LOWER(r.location) LIKE ?`;
        params.push(`%${location.toLowerCase()}%`);
      }

      sql += ` ORDER BY r.created_at DESC`;

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error('[PublicJobsController.listJobs] DB Error:', err);
          return response(res, false, 500, 'Failed to fetch public job openings');
        }

        const formattedJobs = (rows || []).map(r => ({
          id: r.id,
          jobId: r.requirement_code,
          requirementCode: r.requirement_code,
          title: r.job_title,
          slug: createSlug(r.job_title, r.id),
          department: r.department_name || 'Software Development',
          location: r.location || 'Coimbatore',
          employmentType: r.employment_type || 'Full Time',
          experience: `${r.experience_from || 0}-${r.experience_to || 5} Years`,
          experienceFrom: r.experience_from,
          experienceTo: r.experience_to,
          vacancies: r.vacancies || 1,
          salaryMin: r.salary_from,
          salaryMax: r.salary_to,
          description: r.job_description || '',
          jobSummary: r.job_description || '',
          responsibilities: r.responsibilities || '',
          requirements: r.requirements || '',
          skills: r.skills || '',
          status: 'PUBLISHED',
          isActive: true,
          postedDate: r.opening_date ? String(r.opening_date).split('T')[0] : String(r.created_at).split('T')[0],
          publishedAt: r.opening_date || r.created_at,
          closingDate: r.closing_date
        }));

        if (req.query.format === 'array') {
          return res.status(200).json(formattedJobs);
        }

        return res.status(200).json({
          success: true,
          count: formattedJobs.length,
          data: formattedJobs,
          jobs: formattedJobs
        });
      });
    } catch (error) {
      console.error('[PublicJobsController.listJobs] Exception:', error);
      return response(res, false, 500, 'Server error fetching public jobs');
    }
  }

  // GET /api/public/jobs/:slug - Retrieve job details by slug or id
  static async getJobDetails(req, res) {
    try {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      const { slug } = req.params;
      
      let idParam = null;
      const parts = slug.split('-');
      const lastPart = parts[parts.length - 1];
      if (!isNaN(parseInt(lastPart, 10))) {
        idParam = parseInt(lastPart, 10);
      }

      const sql = `
        SELECT r.*, d.dept_name as department_name
        FROM requirements r
        LEFT JOIN departments d ON d.id = r.department_id
        WHERE (r.id = ? OR LOWER(r.requirement_code) = ? OR LOWER(r.job_title) LIKE ?)
          AND r.deleted_at IS NULL
          AND LOWER(r.status) NOT IN ('closed', 'draft', 'archived', 'deleted')
      `;

      const searchTitle = `%${slug.replace(/-/g, ' ')}%`;
      const params = [idParam || 0, slug.toLowerCase(), searchTitle];

      db.query(sql, params, (err, rows) => {
        if (err || !rows || rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'This position is no longer available.'
          });
        }

        const r = rows[0];

        const publicJob = {
          id: r.id,
          jobId: r.requirement_code,
          requirementCode: r.requirement_code,
          title: r.job_title,
          slug: createSlug(r.job_title, r.id),
          department: r.department_name || 'Software Development',
          location: r.location || 'Coimbatore',
          employmentType: r.employment_type || 'Full Time',
          experience: `${r.experience_from || 0}-${r.experience_to || 5} Years`,
          vacancies: r.vacancies || 1,
          salaryMin: r.salary_from,
          salaryMax: r.salary_to,
          description: r.job_description || '',
          jobSummary: r.job_description || '',
          responsibilities: r.responsibilities || '',
          requirements: r.requirements || '',
          skills: r.skills || '',
          status: 'PUBLISHED',
          isActive: true,
          postedDate: r.opening_date ? String(r.opening_date).split('T')[0] : String(r.created_at).split('T')[0],
          publishedAt: r.opening_date || r.created_at,
          closingDate: r.closing_date
        };

        return res.status(200).json({
          success: true,
          job: publicJob,
          data: publicJob
        });
      });
    } catch (error) {
      console.error('[PublicJobsController.getJobDetails] Exception:', error);
      return res.status(404).json({
        success: false,
        message: 'This position is no longer available.'
      });
    }
  }

  // POST /api/public/jobs/:jobId/apply - Submit public candidate job application
  static async applyForJob(req, res) {
    try {
      const jobId = req.params.jobId;
      const {
        fullName, candidate_name,
        email,
        phone, mobile_number,
        currentLocation, address,
        totalExperience, experience,
        currentCompany,
        expectedSalary,
        noticePeriod,
        source
      } = req.body;

      const nameToUse = fullName || candidate_name;
      const emailToUse = email ? email.trim().toLowerCase() : '';
      const phoneToUse = phone || mobile_number || '';

      if (!nameToUse || !emailToUse || !phoneToUse) {
        return response(res, false, 400, 'Full Name, Email, and Phone Number are required fields.');
      }

      let resumePath = null;
      if (req.file) {
        resumePath = '/uploads/' + req.file.filename;
      }

      db.query('SELECT id, job_title, department_id FROM requirements WHERE id = ? OR requirement_code = ?', [jobId, jobId], (err, jobRows) => {
        if (err || !jobRows || jobRows.length === 0) {
          return response(res, false, 404, 'Job opening not found.');
        }

        const targetJob = jobRows[0];

        db.query('SELECT id FROM candidates WHERE LOWER(email) = ? OR mobile_number = ?', [emailToUse, phoneToUse], (cErr, existingCandidates) => {
          
          if (existingCandidates && existingCandidates.length > 0) {
            const candidateId = existingCandidates[0].id;
            const updateSql = `
              UPDATE candidates SET
                candidate_name = ?,
                mobile_number = ?,
                job_position = ?,
                department_id = ?,
                resume = COALESCE(?, resume),
                experience = ?,
                current_company = ?,
                expected_salary = ?,
                notice_period = ?,
                status = 'Applied'
              WHERE id = ?
            `;

            const updateParams = [
              nameToUse, phoneToUse, targetJob.job_title, targetJob.department_id || 1,
              resumePath, totalExperience || experience || '0-1 Years', currentCompany || null,
              expectedSalary || null, noticePeriod || 'Immediate', candidateId
            ];

            db.query(updateSql, updateParams, (uErr) => {
              return res.status(200).json({
                success: true,
                message: 'Your application has been submitted successfully.',
                candidateId,
                jobId: targetJob.id
              });
            });

          } else {
            const insertSql = `
              INSERT INTO candidates (
                candidate_name, email, mobile_number, gender, department_id, job_position,
                resume, experience, current_company, expected_salary, notice_period,
                address, status, created_by, updated_by
              ) VALUES (?, ?, ?, 'Male', ?, ?, ?, ?, ?, ?, ?, ?, 'Applied', 1, 1)
            `;

            const insertParams = [
              nameToUse, emailToUse, phoneToUse, targetJob.department_id || 1, targetJob.job_title,
              resumePath, totalExperience || experience || '0-1 Years', currentCompany || null,
              expectedSalary || null, noticePeriod || 'Immediate', currentLocation || address || null
            ];

            db.query(insertSql, insertParams, (iErr, iRes) => {
              if (iErr) {
                return response(res, false, 500, 'Failed to save application.');
              }

              return res.status(201).json({
                success: true,
                message: 'Your application has been submitted successfully.',
                candidateId: iRes.insertId,
                jobId: targetJob.id
              });
            });
          }

        });
      });

    } catch (error) {
      return response(res, false, 500, 'Server error processing application.');
    }
  }

}

module.exports = PublicJobsController;
