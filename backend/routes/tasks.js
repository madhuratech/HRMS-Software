const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');
const { authenticateJWT, checkRole } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateTask } = require('../validators/taskValidator');

const readRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager', 'Viewer', 'Employee', 'EMPLOYEE', 'Service Staff', 'Sales Manager', 'Team Leader', 'ALL'];
const writeRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager', 'Employee', 'EMPLOYEE', 'Team Leader', 'ALL'];

router.get('/', authenticateJWT, TaskController.list);
router.get('/dashboard', authenticateJWT, TaskController.getDashboard);
router.get('/:id', authenticateJWT, TaskController.getById);

router.post('/', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateTask), TaskController.create);
router.put('/:id', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateTask), TaskController.update);
router.put('/:id/status', authenticateJWT, checkRole(writeRoles), TaskController.updateStatus);
router.delete('/:id', authenticateJWT, checkRole(writeRoles), TaskController.delete);

module.exports = router;