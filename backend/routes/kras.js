const express = require('express');
const router = express.Router();
const { KraController } = require('../controllers/PerformanceController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateKra } = require('../validators/performanceValidators');

router.get('/', authenticateJWT, KraController.list);
router.get('/dashboard', authenticateJWT, KraController.getDashboard);
router.get('/:id', authenticateJWT, KraController.getById);
router.post('/', authenticateJWT, validationMiddleware(validateKra), KraController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validateKra), KraController.update);
router.delete('/:id', authenticateJWT, KraController.delete);

module.exports = router;
