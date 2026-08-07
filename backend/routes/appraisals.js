const express = require('express');
const router = express.Router();
const { AppraisalController } = require('../controllers/PerformanceController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateAppraisal } = require('../validators/performanceValidators');

router.get('/', authenticateJWT, AppraisalController.list);
router.get('/dashboard', authenticateJWT, AppraisalController.getDashboard);
router.get('/:id', authenticateJWT, AppraisalController.getById);
router.post('/', authenticateJWT, validationMiddleware(validateAppraisal), AppraisalController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validateAppraisal), AppraisalController.update);
router.delete('/:id', authenticateJWT, AppraisalController.delete);

module.exports = router;
