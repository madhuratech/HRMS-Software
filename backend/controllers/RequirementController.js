const RequirementService = require('../services/RequirementService');
const response = require('../utils/response');
const getPagination = require('../utils/pagination');

class RequirementController {
  static async create(req, res) {
    try {
      const userId = req.user?.id || 1;
      const data = { ...req.body };
      if (req.file) {
        data.attachment = '/uploads/' + req.file.filename;
      }
      const newReq = await RequirementService.create(data, userId);
      return response(res, true, 212, 'Requirement created successfully', newReq);
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to create requirement', null, err.message);
    }
  }

  static async update(req, res) {
    try {
      const userId = req.user?.id || 1;
      const data = { ...req.body };
      if (req.file) {
        data.attachment = '/uploads/' + req.file.filename;
      }
      await RequirementService.update(req.params.id, data, userId);
      return response(res, true, 200, 'Requirement updated successfully');
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to update requirement', null, err.message);
    }
  }

  static async softDelete(req, res) {
    try {
      const userId = req.user?.id || 1;
      await RequirementService.softDelete(req.params.id, userId);
      return response(res, true, 200, 'Requirement soft deleted successfully');
    } catch (err) {
      return response(res, false, 500, 'Failed to delete requirement', null, err.message);
    }
  }

  static async restore(req, res) {
    try {
      const userId = req.user?.id || 1;
      await RequirementService.restore(req.params.id, userId);
      return response(res, true, 200, 'Requirement restored successfully');
    } catch (err) {
      return response(res, false, 500, 'Failed to restore requirement', null, err.message);
    }
  }

  static async getById(req, res) {
    try {
      const requirement = await RequirementService.getById(req.params.id);
      if (!requirement) {
        return response(res, false, 404, 'Requirement not found');
      }
      return response(res, true, 200, 'Requirement retrieved successfully', requirement);
    } catch (err) {
      return response(res, false, 500, 'Failed to fetch requirement details', null, err.message);
    }
  }

  static async list(req, res) {
    try {
      const pagination = getPagination(req);
      const filters = {
        search: req.query.search || '',
        department_id: req.query.department_id || null,
        designation_id: req.query.designation_id || null,
        status: req.query.status || null,
        priority: req.query.priority || null,
        employment_type: req.query.employment_type || null,
        branch_id: req.query.branch_id || null,
        company_id: req.query.company_id || null,
        opening_date: req.query.opening_date || null,
        closing_date: req.query.closing_date || null,
        sortBy: req.query.sortBy || 'newest'
      };

      const result = await RequirementService.list(filters, pagination);
      return response(res, true, 200, 'Requirements list retrieved successfully', {
        requirements: result.rows,
        total: result.total,
        page: pagination.page,
        limit: pagination.limit
      });
    } catch (err) {
      return response(res, false, 500, 'Failed to fetch requirements list', null, err.message);
    }
  }

  static async dropdown(req, res) {
    try {
      const list = await RequirementService.list({ sortBy: 'job_title' }, { limit: 1000, offset: 0 });
      const dropdownData = list.rows.map(item => ({
        id: item.id,
        requirement_code: item.requirement_code,
        job_title: item.job_title
      }));
      return response(res, true, 200, 'Requirement dropdown list', dropdownData);
    } catch (err) {
      return response(res, false, 500, 'Failed to fetch dropdown list', null, err.message);
    }
  }

  static async approve(req, res) {
    try {
      const userId = req.user?.id || 1;
      await RequirementService.updateStatus(req.params.id, 'Approved', 'Approved', req.body.remarks || 'Approved by user', userId);
      return response(res, true, 200, 'Requirement approved successfully');
    } catch (err) {
      return response(res, false, 500, 'Failed to approve requirement', null, err.message);
    }
  }

  static async reject(req, res) {
    try {
      const userId = req.user?.id || 1;
      await RequirementService.updateStatus(req.params.id, 'Rejected', 'Rejected', req.body.remarks || 'Rejected by user', userId);
      return response(res, true, 200, 'Requirement rejected successfully');
    } catch (err) {
      return response(res, false, 500, 'Failed to reject requirement', null, err.message);
    }
  }

  static async close(req, res) {
    try {
      const userId = req.user?.id || 1;
      await RequirementService.updateStatus(req.params.id, 'Closed', req.body.approval_status || 'Approved', req.body.remarks || 'Closed by user', userId);
      return response(res, true, 200, 'Requirement closed successfully');
    } catch (err) {
      return response(res, false, 500, 'Failed to close requirement', null, err.message);
    }
  }

  static async reopen(req, res) {
    try {
      const userId = req.user?.id || 1;
      await RequirementService.updateStatus(req.params.id, 'Open', 'Approved', req.body.remarks || 'Reopened by user', userId);
      return response(res, true, 200, 'Requirement reopened successfully');
    } catch (err) {
      return response(res, false, 500, 'Failed to reopen requirement', null, err.message);
    }
  }

  static async duplicate(req, res) {
    try {
      const userId = req.user?.id || 1;
      const copy = await RequirementService.duplicate(req.params.id, userId);
      return response(res, true, 200, 'Requirement duplicated successfully', copy);
    } catch (err) {
      return response(res, false, 500, 'Failed to duplicate requirement', null, err.message);
    }
  }

  static async bulkDelete(req, res) {
    try {
      const userId = req.user?.id || 1;
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return response(res, false, 400, 'No IDs provided for bulk deletion');
      }
      for (const id of ids) {
        await RequirementService.softDelete(id, userId);
      }
      return response(res, true, 200, 'Bulk delete completed successfully');
    } catch (err) {
      return response(res, false, 500, 'Bulk delete failed', null, err.message);
    }
  }

  static async bulkStatusUpdate(req, res) {
    try {
      const userId = req.user?.id || 1;
      const { ids, status } = req.body;
      if (!Array.isArray(ids) || ids.length === 0 || !status) {
        return response(res, false, 400, 'Invalid parameters for bulk status update');
      }
      for (const id of ids) {
        await RequirementService.updateStatus(id, status, 'Approved', 'Bulk Status Update', userId);
      }
      return response(res, true, 200, 'Bulk status update completed successfully');
    } catch (err) {
      return response(res, false, 500, 'Bulk status update failed', null, err.message);
    }
  }

  static async getDashboard(req, res) {
    try {
      const stats = await RequirementService.getDashboardStats();
      return response(res, true, 200, 'Dashboard statistics retrieved successfully', stats);
    } catch (err) {
      return response(res, false, 500, 'Failed to retrieve dashboard stats', null, err.message);
    }
  }
}

module.exports = RequirementController;
