const OfferLetterService = require('../services/OfferLetterService');
const response = require('../utils/response');
const getPagination = require('../utils/pagination');

class OfferLetterController {
  static async create(req, res) {
    try {
      const userId = req.user?.id || 1;
      const data = { ...req.body };
      const result = await OfferLetterService.create(data, userId);
      return response(res, true, 201, 'Offer Letter created successfully.', result);
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to create offer letter', null, err.message);
    }
  }

  static async update(req, res) {
    try {
      const userId = req.user?.id || 1;
      const data = { ...req.body };
      await OfferLetterService.update(req.params.id, data, userId);
      return response(res, true, 200, 'Offer Letter updated successfully.');
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to update offer letter', null, err.message);
    }
  }

  static async delete(req, res) {
    try {
      await OfferLetterService.delete(req.params.id);
      return response(res, true, 200, 'Offer Letter deleted successfully.');
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to delete offer letter', null, err.message);
    }
  }

  static async getById(req, res) {
    try {
      const offer = await OfferLetterService.getById(req.params.id);
      if (!offer) {
        return response(res, false, 404, 'Offer Letter not found');
      }
      return response(res, true, 200, 'Offer Letter retrieved successfully', offer);
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to retrieve offer letter', null, err.message);
    }
  }

  static async list(req, res) {
    try {
      const pagination = getPagination(req);
      const filters = {
        search: req.query.search || '',
        department_id: req.query.department_id || null,
        status: req.query.status || null
      };

      const result = await OfferLetterService.list(filters, pagination);
      return response(res, true, 200, 'Offer Letters list retrieved successfully', {
        offers: result.rows,
        total: result.total,
        page: pagination.page,
        limit: pagination.limit
      });
    } catch (err) {
      console.error(err);
      return response(res, false, 500, 'Failed to fetch offer letters', null, err.message);
    }
  }
}

module.exports = OfferLetterController;
