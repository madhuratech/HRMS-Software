const express = require('express');
const router = express.Router();
const CandidateController = require('../controllers/CandidateController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateCandidate } = require('../validators/candidateValidator');
const upload = require('../utils/fileUpload');

// Base routes protected by authenticateJWT
router.get('/', authenticateJWT, CandidateController.list);
router.get('/dropdown', authenticateJWT, CandidateController.dropdown);
router.get('/:id', authenticateJWT, CandidateController.getById);

router.post('/', authenticateJWT, upload.single('resume'), validationMiddleware(validateCandidate), CandidateController.create);
router.put('/:id', authenticateJWT, upload.single('resume'), validationMiddleware(validateCandidate), CandidateController.update);
router.delete('/:id', authenticateJWT, CandidateController.delete);

module.exports = router;
