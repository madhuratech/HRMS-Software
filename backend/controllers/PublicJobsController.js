const db = require('../config/database');
const response = require('../utils/response');

function createSlug(title, id) {
  const cleanTitle = String(title || 'job-opening')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${cleanTitle}-${id}`;
}

class PublicJobsController {
  /**
   * ==========================================
   * GET /api/public/jobs
   * List all published active jobs
   * ==========================================
   */
  static async listJobs(req, res) {
    try {
      // Prevent caching so changes in HRMS appear immediately
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const { search, department, employment_type, location } = req.query;

      let sql = `
        SELECT
          r.*,
          d.dept_name AS department_name
        FROM requirements r
        LEFT JOIN departments d ON d.id = r.department_id
        WHERE
          r.deleted_at IS NULL
          AND LOWER(r.status) IN ('published', 'open', 'approved')
          AND LOWER(r.status) NOT IN ('closed', 'draft', 'archived', 'deleted', 'cancelled', 'on hold')
          AND (
            r.closing_date IS NULL
            OR r.closing_date >= CURRENT_DATE()
          )
      `;

      const params = [];

      // Keyword Search
      if (search) {
        sql += `
          AND (
            LOWER(r.job_title) LIKE ?
            OR LOWER(r.skills) LIKE ?
            OR LOWER(r.job_description) LIKE ?
          )
        `;
        const term = `%${search.toLowerCase()}%`;
        params.push(term, term, term);
      }

      // Department Filter
      if (department) {
        sql += `
          AND (
            LOWER(d.dept_name) = ?
            OR r.department_id = ?
          )
        `;
        params.push(department.toLowerCase(), parseInt(department, 10) || 0);
      }

      // Employment Type Filter
      if (employment_type) {
        sql += ` AND LOWER(r.employment_type) = ?`;
        params.push(employment_type.toLowerCase());
      }

      // Location Filter
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

        const formattedJobs = (rows || []).map((r) => {
          const slug = createSlug(r.job_title, r.id);
          const applyUrl = `https://madhuratech.com/career/?job=${encodeURIComponent(slug)}`;

          // Experience formatting
          let experienceStr = 'Not Specified';
          if (r.experience_from != null || r.experience_to != null) {
            experienceStr = `${r.experience_from || 0}-${r.experience_to || 5} Years`;
          }

          // Salary formatting
          let salaryStr = 'Best in Industry';
          if (r.salary_from && r.salary_to) {
            salaryStr = `₹${Number(r.salary_from).toLocaleString()} - ₹${Number(r.salary_to).toLocaleString()}`;
          } else if (r.salary_from) {
            salaryStr = `₹${Number(r.salary_from).toLocaleString()}+`;
          }

          return {
            id: r.id,
            jobId: r.requirement_code || String(r.id),
            requirementCode: r.requirement_code || String(r.id),
            title: r.job_title,
            jobTitle: r.job_title,
            slug,
            department: r.department_name || 'Software Development',
            departmentName: r.department_name || 'Software Development',
            departmentId: r.department_id,
            location: r.location || 'Coimbatore',
            employmentType: r.employment_type || 'Full Time',
            experience: experienceStr,
            experienceFrom: r.experience_from != null ? r.experience_from : 0,
            experienceTo: r.experience_to != null ? r.experience_to : 5,
            vacancies: r.vacancies || 1,
            salaryMin: r.salary_from,
            salaryMax: r.salary_to,
            salary: salaryStr,
            description: r.job_description || '',
            jobSummary: r.job_description || '',
            responsibilities: r.responsibilities || r.job_description || '',
            requirements: r.requirements || r.skills || '',
            skills: r.skills || '',
            status: 'Published',
            isActive: true,
            postedDate: r.opening_date
              ? String(r.opening_date).split('T')[0]
              : String(r.created_at).split('T')[0],
            publishedAt: r.opening_date || r.created_at,
            closingDate: r.closing_date,
            applyUrl,
            jobUrl: applyUrl
          };
        });

        // Array format support for endpoints requesting raw array
        if (req.query.format === 'array') {
          return res.status(200).json(formattedJobs);
        }

        // Multi-field object format so WordPress & frontend receive data seamlessly
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

  /**
   * ==========================================
   * GET /api/public/jobs/:slug
   * Retrieve single job details
   * ==========================================
   */
  static async getJobDetails(req, res) {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const { slug } = req.params;

      // Check if slug contains an ID suffix or is directly an ID
      let idParam = null;
      if (!isNaN(parseInt(slug, 10))) {
        idParam = parseInt(slug, 10);
      } else {
        const parts = slug.split('-');
        const lastPart = parts[parts.length - 1];
        if (!isNaN(parseInt(lastPart, 10))) {
          idParam = parseInt(lastPart, 10);
        }
      }

      const sql = `
        SELECT
          r.*,
          d.dept_name AS department_name
        FROM requirements r
        LEFT JOIN departments d ON d.id = r.department_id
        WHERE
          (
            r.id = ?
            OR LOWER(r.requirement_code) = ?
            OR LOWER(r.job_title) LIKE ?
          )
          AND r.deleted_at IS NULL
          AND LOWER(r.status) IN ('published', 'open', 'approved')
          AND LOWER(r.status) NOT IN ('closed', 'draft', 'archived', 'deleted')
          AND (
            r.closing_date IS NULL
            OR r.closing_date >= CURRENT_DATE()
          )
        LIMIT 1
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
        const jobSlug = createSlug(r.job_title, r.id);
        const applyUrl = `https://madhuratech.com/career/?job=${encodeURIComponent(jobSlug)}`;

        let experienceStr = 'Not Specified';
        if (r.experience_from != null || r.experience_to != null) {
          experienceStr = `${r.experience_from || 0}-${r.experience_to || 5} Years`;
        }

        let salaryStr = 'Best in Industry';
        if (r.salary_from && r.salary_to) {
          salaryStr = `₹${Number(r.salary_from).toLocaleString()} - ₹${Number(r.salary_to).toLocaleString()}`;
        } else if (r.salary_from) {
          salaryStr = `₹${Number(r.salary_from).toLocaleString()}+`;
        }

        const publicJob = {
          id: r.id,
          jobId: r.requirement_code || String(r.id),
          requirementCode: r.requirement_code || String(r.id),
          title: r.job_title,
          jobTitle: r.job_title,
          slug: jobSlug,
          department: r.department_name || 'Software Development',
          departmentName: r.department_name || 'Software Development',
          departmentId: r.department_id,
          location: r.location || 'Coimbatore',
          employmentType: r.employment_type || 'Full Time',
          experience: experienceStr,
          experienceFrom: r.experience_from != null ? r.experience_from : 0,
          experienceTo: r.experience_to != null ? r.experience_to : 5,
          vacancies: r.vacancies || 1,
          salaryMin: r.salary_from,
          salaryMax: r.salary_to,
          salary: salaryStr,
          description: r.job_description || '',
          jobSummary: r.job_description || '',
          responsibilities: r.responsibilities || r.job_description || '',
          requirements: r.requirements || r.skills || '',
          skills: r.skills || '',
          status: 'Published',
          isActive: true,
          postedDate: r.opening_date
            ? String(r.opening_date).split('T')[0]
            : String(r.created_at).split('T')[0],
          publishedAt: r.opening_date || r.created_at,
          closingDate: r.closing_date,
          applyUrl,
          jobUrl: applyUrl
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

  /**
   * ==========================================
   * POST /api/public/jobs/:jobId/apply
   * Submit job application from WordPress or career portal
   * ==========================================
   */
  static async applyForJob(req, res) {
    try {
      const jobId = req.params.jobId;
      const {
        fullName,
        candidate_name,
        name,
        email,
        phone,
        mobile_number,
        mobile,
        currentLocation,
        address,
        totalExperience,
        experience,
        currentCompany,
        expectedSalary,
        noticePeriod,
        gender
      } = req.body;

      const nameToUse = fullName || candidate_name || name;
      const emailToUse = email ? email.trim().toLowerCase() : '';
      const phoneToUse = phone || mobile_number || mobile || '';

      if (!nameToUse || !emailToUse || !phoneToUse) {
        return response(
          res,
          false,
          400,
          'Full Name, Email, and Phone Number are required fields.'
        );
      }

      let resumePath = null;
      if (req.file) {
        resumePath = '/uploads/' + req.file.filename;
      }

      // Application is allowed ONLY for currently published and active jobs
      const jobSql = `
        SELECT
          id,
          job_title,
          department_id
        FROM requirements
        WHERE
          (id = ? OR requirement_code = ?)
          AND r.deleted_at IS NULL
          AND LOWER(status) IN ('published', 'open', 'approved')
          AND LOWER(status) NOT IN ('closed', 'draft', 'archived', 'deleted')
          AND (
            closing_date IS NULL
            OR closing_date >= CURRENT_DATE()
          )
        LIMIT 1
      `;

      const parseSalary = (val) => {
        if (val === undefined || val === null || val === '') return null;
        const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
        return isNaN(num) ? null : num;
      };

      const currentSalaryVal = parseSalary(req.body.currentSalary || req.body.current_salary);
      const expectedSalaryVal = parseSalary(req.body.expectedSalary || req.body.expected_salary);
      const currentCompanyVal = req.body.currentCompany || req.body.current_company || null;
      const noticePeriodVal = req.body.noticePeriod || req.body.notice_period || 'Immediate';

      db.query(
        'SELECT id, job_title, department_id FROM requirements WHERE (id = ? OR requirement_code = ?) AND deleted_at IS NULL AND LOWER(status) IN (\'published\', \'open\', \'approved\') LIMIT 1',
        [jobId, jobId],
        (err, jobRows) => {
          if (err || !jobRows || jobRows.length === 0) {
            return response(
              res,
              false,
              404,
              'This job opening is no longer available for applications.'
            );
          }

          const targetJob = jobRows[0];

          // Duplicate detection: check if applicant already applied for this job
          db.query(
            'SELECT id, status, created_at FROM candidates WHERE (LOWER(email) = ? OR mobile_number = ?) AND LOWER(job_position) = LOWER(?)',
            [emailToUse, phoneToUse, targetJob.job_title],
            (cErr, existingMatches) => {
              if (existingMatches && existingMatches.length > 0) {
                return res.status(200).json({
                  success: false,
                  alreadyApplied: true,
                  message: `You have already applied for the ${targetJob.job_title} position. Our HR recruitment team is currently reviewing your profile.`
                });
              }

              const insertSql = `
                INSERT INTO candidates (
                  candidate_name,
                  email,
                  mobile_number,
                  gender,
                  department_id,
                  job_position,
                  resume,
                  experience,
                  current_company,
                  current_salary,
                  expected_salary,
                  notice_period,
                  address,
                  status,
                  created_by,
                  updated_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Applied', 1, 1)
              `;

              const insertParams = [
                nameToUse,
                emailToUse,
                phoneToUse,
                gender || 'Male',
                targetJob.department_id || 1,
                targetJob.job_title,
                resumePath,
                totalExperience || experience || '0-1 Years',
                currentCompanyVal,
                currentSalaryVal,
                expectedSalaryVal,
                noticePeriodVal,
                currentLocation || address || null
              ];

              db.query(insertSql, insertParams, (iErr, iRes) => {
                if (iErr) {
                  console.error('[applyForJob] Insert Error:', iErr);
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
          );
        }
      );
    } catch (error) {
      console.error('[applyForJob] Exception:', error);
      return response(res, false, 500, 'Server error processing application.');
    }
  }
}

module.exports = PublicJobsController;