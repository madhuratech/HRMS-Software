const express = require('express');
const router = express.Router();
const OrientationController = require('../controllers/OrientationController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateOrientation } = require('../validators/orientationValidator');

router.get('/', authenticateJWT, OrientationController.list);
router.get('/dashboard', authenticateJWT, OrientationController.getDashboard);
router.get('/eligible', authenticateJWT, OrientationController.getEligibleJoiners);
router.get('/:id', authenticateJWT, OrientationController.getById);

router.post('/', authenticateJWT, validationMiddleware(validateOrientation), OrientationController.schedule);
router.put('/:id', authenticateJWT, validationMiddleware(validateOrientation), OrientationController.update);
router.put('/:id/complete', authenticateJWT, OrientationController.complete);
router.delete('/:id', authenticateJWT, OrientationController.delete);

module.exports = router;
