const express = require('express');
const router = express.Router();
const { KpiController } = require('../controllers/PerformanceController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateKpi } = require('../validators/performanceValidators');

router.get('/', authenticateJWT, KpiController.list);
router.get('/dashboard', authenticateJWT, KpiController.getDashboard);
router.get('/:id', authenticateJWT, KpiController.getById);
router.post('/', authenticateJWT, validationMiddleware(validateKpi), KpiController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validateKpi), KpiController.update);
router.delete('/:id', authenticateJWT, KpiController.delete);

module.exports = router;
