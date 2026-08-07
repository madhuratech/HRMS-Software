const express = require('express');
const router = express.Router();
const NewJoinerController = require('../controllers/NewJoinerController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateNewJoiner } = require('../validators/newJoinerValidator');

router.get('/', authenticateJWT, NewJoinerController.list);
router.get('/dashboard', authenticateJWT, NewJoinerController.getDashboard);
router.get('/:id', authenticateJWT, NewJoinerController.getById);

router.post('/', authenticateJWT, validationMiddleware(validateNewJoiner), NewJoinerController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validateNewJoiner), NewJoinerController.update);
router.delete('/:id', authenticateJWT, NewJoinerController.delete);

module.exports = router;
