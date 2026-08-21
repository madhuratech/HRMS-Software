const express = require('express');
const router = express.Router();
const TimesheetController = require('../controllers/TimesheetController');
const { authenticateJWT, checkRole } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateTimesheet } = require('../validators/timesheetValidator');

const readRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager', 'Viewer'];
const writeRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager'];

router.get('/', authenticateJWT, checkRole(readRoles), TimesheetController.list);
router.get('/summary', authenticateJWT, checkRole(readRoles), TimesheetController.getSummary);
router.get('/:id', authenticateJWT, checkRole(readRoles), TimesheetController.getById);

router.post('/', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateTimesheet), TimesheetController.create);
router.put('/:id', authenticateJWT, checkRole(writeRoles), validationMiddleware(validateTimesheet), TimesheetController.update);
router.delete('/:id', authenticateJWT, checkRole(writeRoles), TimesheetController.delete);

module.exports = router;
