const express = require('express');
const router = express.Router();
const ProbationController = require('../controllers/ProbationController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateProbation } = require('../validators/probationValidator');

router.get('/', authenticateJWT, ProbationController.list);
router.get('/dashboard', authenticateJWT, ProbationController.getDashboard);
router.get('/:id', authenticateJWT, ProbationController.getById);

router.post('/', authenticateJWT, validationMiddleware(validateProbation), ProbationController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validateProbation), ProbationController.update);
router.put('/:id/extend', authenticateJWT, ProbationController.extend);
router.put('/:id/complete', authenticateJWT, ProbationController.complete);
router.delete('/:id', authenticateJWT, ProbationController.delete);

module.exports = router;
