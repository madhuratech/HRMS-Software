const express = require('express');
const router = express.Router();
const { GoalController } = require('../controllers/PerformanceController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateGoal } = require('../validators/goalValidator');

router.get('/', authenticateJWT, GoalController.list);
router.get('/dashboard', authenticateJWT, GoalController.getDashboard);
router.get('/:id', authenticateJWT, GoalController.getById);
router.post('/', authenticateJWT, validationMiddleware(validateGoal), GoalController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validateGoal), GoalController.update);
router.delete('/:id', authenticateJWT, GoalController.delete);

module.exports = router;
