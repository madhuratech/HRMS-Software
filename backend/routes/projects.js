const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');
const { authenticateJWT, checkRole } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateProject } = require('../validators/projectValidator');

const readRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager', 'Viewer'];
const writeRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager'];

router.get('/', authenticateJWT, checkRole(readRoles), ProjectController.list);
router.get('/meta', authenticateJWT, checkRole(readRoles), ProjectController.meta);
router.get('/dashboard', authenticateJWT, checkRole(readRoles), ProjectController.getDashboard);
router.get('/:id', authenticateJWT, checkRole(readRoles), ProjectController.getById);

router.post('/', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateProject), ProjectController.create);
router.put('/:id', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateProject), ProjectController.update);
router.delete('/:id', authenticateJWT, checkRole(writeRoles), ProjectController.delete);

module.exports = router;
