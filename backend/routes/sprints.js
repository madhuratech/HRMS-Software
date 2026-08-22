const express = require('express');
const router = express.Router();
const SprintController = require('../controllers/SprintController');
const { authenticateJWT, checkRole } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateSprint } = require('../validators/sprintValidator');

const readRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager', 'Viewer'];
const writeRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager'];

router.get('/', authenticateJWT, checkRole(readRoles), SprintController.list);
router.get('/board', authenticateJWT, checkRole(readRoles), SprintController.getBoard);
router.get('/dashboard', authenticateJWT, checkRole(readRoles), SprintController.getDashboard);
router.get('/:id', authenticateJWT, checkRole(readRoles), SprintController.getById);

router.post('/', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateSprint), SprintController.create);
router.put('/:id', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateSprint), SprintController.update);
router.put('/:id/status', authenticateJWT, checkRole(writeRoles), SprintController.updateStatus);
router.delete('/:id', authenticateJWT, checkRole(writeRoles), SprintController.delete);

module.exports = router;