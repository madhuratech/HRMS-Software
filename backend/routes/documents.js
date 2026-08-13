const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/DocumentController');
const { authenticateJWT } = require('../middlewares/auth');
const upload = require('../utils/fileUpload');

// Metadata & Dashboard
router.get('/meta', authenticateJWT, DocumentController.getMeta);
router.get('/dashboard', authenticateJWT, DocumentController.getDashboard);

// Employee Documents (Supporting File Uploads)
router.get('/employee', authenticateJWT, DocumentController.listEmployeeDocs);
router.post('/employee', authenticateJWT, upload.single('file'), DocumentController.createEmployeeDoc);
router.put('/employee/:id', authenticateJWT, upload.single('file'), DocumentController.updateEmployeeDoc);
router.delete('/employee/:id', authenticateJWT, DocumentController.deleteEmployeeDoc);

// Company Documents
router.get('/company', authenticateJWT, DocumentController.listCompanyDocs);
router.post('/company', authenticateJWT, upload.single('file'), DocumentController.createCompanyDoc);
router.put('/company/:id', authenticateJWT, upload.single('file'), DocumentController.updateCompanyDoc);
router.delete('/company/:id', authenticateJWT, DocumentController.deleteCompanyDoc);

// HR Policies
router.get('/policies', authenticateJWT, DocumentController.listPolicies);
router.post('/policies', authenticateJWT, DocumentController.createPolicy);
router.put('/policies/:id', authenticateJWT, DocumentController.updatePolicy);
router.delete('/policies/:id', authenticateJWT, DocumentController.deletePolicy);

// Templates
router.get('/templates', authenticateJWT, DocumentController.listTemplates);
router.post('/templates', authenticateJWT, DocumentController.createTemplate);
router.put('/templates/:id', authenticateJWT, DocumentController.updateTemplate);
router.delete('/templates/:id', authenticateJWT, DocumentController.deleteTemplate);

// Digital Signatures
router.get('/signatures', authenticateJWT, DocumentController.listSignatures);
router.post('/signatures', authenticateJWT, DocumentController.createSignature);
router.put('/signatures/:id', authenticateJWT, DocumentController.updateSignature);
router.delete('/signatures/:id', authenticateJWT, DocumentController.deleteSignature);

module.exports = router;
