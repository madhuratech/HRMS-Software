const express = require('express');
const router = express.Router();
const MilestoneController = require('../controllers/MilestoneController');
const { authenticateJWT, checkRole } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateMilestone } = require('../validators/milestoneValidator');

const readRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager', 'Viewer'];
const writeRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager'];

router.get('/', authenticateJWT, checkRole(readRoles), MilestoneController.list);
router.get('/dashboard', authenticateJWT, checkRole(readRoles), MilestoneController.getDashboard);
router.get('/:id', authenticateJWT, checkRole(readRoles), MilestoneController.getById);

router.post('/', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateMilestone), MilestoneController.create);
router.put('/:id', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateMilestone), MilestoneController.update);
router.put('/:id/complete', authenticateJWT, checkRole(writeRoles), MilestoneController.complete);
router.delete('/:id', authenticateJWT, checkRole(writeRoles), MilestoneController.delete);

module.exports = router;
