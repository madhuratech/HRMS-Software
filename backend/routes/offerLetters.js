const express = require('express');
const router = express.Router();
const OfferLetterController = require('../controllers/OfferLetterController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateOfferLetter } = require('../validators/offerLetterValidator');

router.get('/', authenticateJWT, OfferLetterController.list);
router.get('/:id', authenticateJWT, OfferLetterController.getById);

router.post('/', authenticateJWT, validationMiddleware(validateOfferLetter), OfferLetterController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validateOfferLetter), OfferLetterController.update);
router.delete('/:id', authenticateJWT, OfferLetterController.delete);

module.exports = router;
