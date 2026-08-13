const express = require('express');
const router = express.Router();
const RequirementController = require('../controllers/RequirementController');
const { authenticateJWT, checkRole } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateRequirement } = require('../validators/requirementValidator');
const upload = require('../utils/fileUpload');

// Base Roles allowed to view requirements list
const readRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager', 'Viewer'];
const writeRoles = ['Super Admin', 'HR Admin', 'HR Manager', 'Department Manager'];
const adminRoles = ['Super Admin', 'HR Admin', 'HR Manager'];

const db = require('../config/database');

router.get('/meta/all', authenticateJWT, (req, res) => {
  db.query("SELECT id, role_name as name FROM designations", (err, desigs) => {
    db.query("SELECT id, branch_name as name FROM branches", (err, branches) => {
      db.query("SELECT id, name FROM employees", (err, employees) => {
        res.json({
          designations: desigs || [],
          branches: branches || [],
          employees: employees || [],
          departments: [
            { id: 1, name: 'Engineering' },
            { id: 2, name: 'Human Resources' },
            { id: 3, name: 'Design' },
            { id: 4, name: 'Finance' },
            { id: 5, name: 'Sales' },
            { id: 6, name: 'Marketing' }
          ],
          companies: [
            { id: 1, name: 'Hawkeye Nest Ltd' }
          ]
        });
      });
    });
  });
});

router.get('/', authenticateJWT, checkRole(readRoles), RequirementController.list);
router.get('/dropdown', authenticateJWT, checkRole(readRoles), RequirementController.dropdown);
router.get('/dashboard', authenticateJWT, checkRole(readRoles), RequirementController.getDashboard);
router.get('/:id', authenticateJWT, checkRole(readRoles), RequirementController.getById);

router.post('/', authenticateJWT, checkRole(writeRoles), upload.single('attachment'), validationMiddleware(validateRequirement), RequirementController.create);
router.put('/:id', authenticateJWT, checkRole(writeRoles), upload.single('attachment'), validationMiddleware(validateRequirement), RequirementController.update);
router.delete('/:id', authenticateJWT, checkRole(writeRoles), RequirementController.softDelete);

router.post('/:id/restore', authenticateJWT, checkRole(writeRoles), RequirementController.restore);
router.post('/:id/approve', authenticateJWT, checkRole(adminRoles), RequirementController.approve);
router.post('/:id/reject', authenticateJWT, checkRole(adminRoles), RequirementController.reject);
router.post('/:id/close', authenticateJWT, checkRole(writeRoles), RequirementController.close);
router.post('/:id/reopen', authenticateJWT, checkRole(writeRoles), RequirementController.reopen);
router.post('/:id/duplicate', authenticateJWT, checkRole(writeRoles), RequirementController.duplicate);

router.post('/bulk-delete', authenticateJWT, checkRole(writeRoles), RequirementController.bulkDelete);
router.post('/bulk-status', authenticateJWT, checkRole(adminRoles), RequirementController.bulkStatusUpdate);

module.exports = router;
