const express = require('express');
const router = express.Router();
const HiringPipelineController = require('../controllers/HiringPipelineController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateRecruitmentSource } = require('../validators/recruitmentSourceValidator');

router.get('/stats', authenticateJWT, HiringPipelineController.getStats);
router.get('/sources', authenticateJWT, HiringPipelineController.getSources);
router.post('/sources', authenticateJWT, validationMiddleware(validateRecruitmentSource), HiringPipelineController.createSource);

module.exports = router;
