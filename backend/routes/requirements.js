const express = require('express');
const router = express.Router();
const RequirementController = require('../controllers/RequirementController');
const { authenticateJWT, checkPermission } = require('../middlewares/auth');
const validationMiddleware = require('../middlewares/validation');
const { validateRequirement } = require('../validators/requirementValidator');
const upload = require('../utils/fileUpload');

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

router.get('/', authenticateJWT, checkPermission('recruitment', 'job_openings', 'view'), RequirementController.list);
router.get('/dropdown', authenticateJWT, checkPermission('recruitment', 'job_openings', 'view'), RequirementController.dropdown);
router.get('/dashboard', authenticateJWT, checkPermission('recruitment', 'job_openings', 'view'), RequirementController.getDashboard);
router.get('/:id', authenticateJWT, checkPermission('recruitment', 'job_openings', 'view'), RequirementController.getById);

router.post('/', authenticateJWT, checkPermission('recruitment', 'job_openings', 'create'), upload.single('attachment'), validationMiddleware(validateRequirement), RequirementController.create);
router.put('/:id', authenticateJWT, checkPermission('recruitment', 'job_openings', 'edit'), upload.single('attachment'), validationMiddleware(validateRequirement), RequirementController.update);
router.delete('/:id', authenticateJWT, checkPermission('recruitment', 'job_openings', 'delete'), RequirementController.softDelete);

router.post('/:id/restore', authenticateJWT, checkPermission('recruitment', 'job_openings', 'edit'), RequirementController.restore);
router.post('/:id/publish', authenticateJWT, checkPermission('recruitment', 'job_openings', 'edit'), RequirementController.publish);
router.post('/:id/publish-linkedin', authenticateJWT, checkPermission('recruitment', 'job_openings', 'edit'), RequirementController.publishLinkedIn);
router.get('/:id/publishing-channels', authenticateJWT, checkPermission('recruitment', 'job_openings', 'view'), RequirementController.getPublishingChannels);
router.post('/:id/retry-publish', authenticateJWT, checkPermission('recruitment', 'job_openings', 'edit'), RequirementController.retryPublishChannel);
router.post('/:id/approve', authenticateJWT, checkPermission('recruitment', 'job_openings', 'edit'), RequirementController.approve);
router.post('/:id/reject', authenticateJWT, checkPermission('recruitment', 'job_openings', 'edit'), RequirementController.reject);
router.post('/:id/close', authenticateJWT, checkPermission('recruitment', 'job_openings', 'edit'), RequirementController.close);
router.post('/:id/reopen', authenticateJWT, checkPermission('recruitment', 'job_openings', 'edit'), RequirementController.reopen);
router.post('/:id/duplicate', authenticateJWT, checkPermission('recruitment', 'job_openings', 'create'), RequirementController.duplicate);

router.post('/bulk-delete', authenticateJWT, checkPermission('recruitment', 'job_openings', 'delete'), RequirementController.bulkDelete);
router.post('/bulk-status', authenticateJWT, checkPermission('recruitment', 'job_openings', 'edit'), RequirementController.bulkStatusUpdate);

module.exports = router;
