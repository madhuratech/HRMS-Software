const express = require('express');
const router = express.Router();
const { FeedbackController } = require('../controllers/PerformanceController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateFeedback } = require('../validators/performanceValidators');

router.get('/', authenticateJWT, FeedbackController.list);
router.get('/dashboard', authenticateJWT, FeedbackController.getDashboard);
router.get('/:id', authenticateJWT, FeedbackController.getById);
router.post('/', authenticateJWT, validationMiddleware(validateFeedback), FeedbackController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validateFeedback), FeedbackController.update);
router.delete('/:id', authenticateJWT, FeedbackController.delete);

module.exports = router;
