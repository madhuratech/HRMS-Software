const express = require('express');
const router = express.Router();
const { ReviewController } = require('../controllers/PerformanceController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateReview } = require('../validators/performanceValidators');

router.get('/', authenticateJWT, ReviewController.list);
router.get('/dashboard', authenticateJWT, ReviewController.getDashboard);
router.get('/:id', authenticateJWT, ReviewController.getById);
router.post('/', authenticateJWT, validationMiddleware(validateReview), ReviewController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validateReview), ReviewController.update);
router.delete('/:id', authenticateJWT, ReviewController.delete);

module.exports = router;
