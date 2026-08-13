const express = require('express');
const router = express.Router();
const InterviewScheduleController = require('../controllers/InterviewScheduleController');
const { authenticateJWT } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateInterview } = require('../validators/interviewValidator');

router.get('/', authenticateJWT, InterviewScheduleController.list);
router.get('/dashboard', authenticateJWT, InterviewScheduleController.getDashboard);
router.get('/:id', authenticateJWT, InterviewScheduleController.getById);

router.post('/', authenticateJWT, validationMiddleware(validateInterview), InterviewScheduleController.create);
router.put('/:id', authenticateJWT, validationMiddleware(validateInterview), InterviewScheduleController.update);
router.put('/:id/status', authenticateJWT, InterviewScheduleController.updateStatus);
router.delete('/:id', authenticateJWT, InterviewScheduleController.delete);

module.exports = router;
