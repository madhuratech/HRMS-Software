const express = require('express');
const router = express.Router();
const { PromotionController } = require('../controllers/PerformanceController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validatePromotion } = require('../validators/promotionValidator');

router.get('/', authenticateJWT, PromotionController.list);
router.get('/dashboard', authenticateJWT, PromotionController.getDashboard);
router.get('/:id', authenticateJWT, PromotionController.getById);
router.post('/', authenticateJWT, validationMiddleware(validatePromotion), PromotionController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validatePromotion), PromotionController.update);
router.delete('/:id', authenticateJWT, PromotionController.delete);

module.exports = router;
