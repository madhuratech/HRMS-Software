const CandidateService = require('../services/CandidateService');
const response = require('../utils/response');
const getPagination = require('../utils/pagination');
const path = require('path');

class CandidateController {
  static async create(req, res) {
    try {
      const userId = req.user?.id || 1;
      const data = { ...req.body };

      // Handle resume upload
      if (req.file) {
        // Validate file type
        const ext = path.extname(req.file.originalname).toLowerCase();
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        if (!allowedTypes.includes(ext)) {
          return response(res, false, 400, 'Invalid file type. Only PDF, DOC, and DOCX are allowed.');
        }

        // Validate file size (5 MB = 5 * 1024 * 1024 bytes)
        if (req.file.size > 5 * 1024 * 1024) {
          return response(res, false, 400, 'File size exceeds maximum limit of 5 MB.');
        }

        data.resume = '/uploads/' + req.file.filename;
      } else {
        return response(res, false, 400, 'Resume file is required');
      }

      const result = await CandidateService.create(data, userId);
      return response(res, true, 201, 'Candidate created successfully', result);
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to create candidate', null, err.message);
    }
  }

  static async update(req, res) {
    try {
      const userId = req.user?.id || 1;
      const data = { ...req.body };

      // Handle resume upload if any
      if (req.file) {
        // Validate file type
        const ext = path.extname(req.file.originalname).toLowerCase();
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        if (!allowedTypes.includes(ext)) {
          return response(res, false, 400, 'Invalid file type. Only PDF, DOC, and DOCX are allowed.');
        }

        // Validate file size
        if (req.file.size > 5 * 1024 * 1024) {
          return response(res, false, 400, 'File size exceeds maximum limit of 5 MB.');
        }

        data.resume = '/uploads/' + req.file.filename;
      }

      await CandidateService.update(req.params.id, data, userId);
      return response(res, true, 200, 'Candidate updated successfully');
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to update candidate', null, err.message);
    }
  }

  static async delete(req, res) {
    try {
      await CandidateService.delete(req.params.id);
      return response(res, true, 200, 'Candidate deleted successfully');
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to delete candidate', null, err.message);
    }
  }

  static async getById(req, res) {
    try {
      const candidate = await CandidateService.getById(req.params.id);
      if (!candidate) {
        return response(res, false, 404, 'Candidate not found');
      }
      return response(res, true, 200, 'Candidate retrieved successfully', candidate);
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to retrieve candidate', null, err.message);
    }
  }

  static async list(req, res) {
    try {
      const pagination = getPagination(req);
      const filters = {
        search: req.query.search || '',
        department_id: req.query.department_id || null,
        status: req.query.status || null,
        gender: req.query.gender || null,
        experience: req.query.experience || null,
        has_resume: req.query.has_resume !== undefined ? req.query.has_resume : undefined
      };

      const result = await CandidateService.list(filters, pagination);
      return response(res, true, 200, 'Candidates list retrieved successfully', {
        candidates: result.rows,
        total: result.total,
        page: pagination.page,
        limit: pagination.limit
      });
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to fetch candidates list', null, err.message);
    }
  }

  static async dropdown(req, res) {
    try {
      const candidates = await CandidateService.dropdown();
      return response(res, true, 200, 'Candidate dropdown list retrieved successfully', candidates);
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to fetch candidate dropdown', null, err.message);
    }
  }
}

module.exports = CandidateController;
