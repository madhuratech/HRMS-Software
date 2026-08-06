const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/ExpenseController');
const { authenticateJWT } = require('../middlewares/auth');

// Metadata & Dashboard & Reports
router.get('/meta', authenticateJWT, ExpenseController.getMeta);
router.get('/dashboard', authenticateJWT, ExpenseController.getDashboard);
router.get('/reports', authenticateJWT, ExpenseController.getReports);

// Expense Categories
router.get('/categories', authenticateJWT, ExpenseController.listCategories);
router.post('/categories', authenticateJWT, ExpenseController.createCategory);
router.put('/categories/:id', authenticateJWT, ExpenseController.updateCategory);
router.delete('/categories/:id', authenticateJWT, ExpenseController.deleteCategory);

// Expense Claims
router.get('/claims', authenticateJWT, ExpenseController.listClaims);
router.post('/claims', authenticateJWT, ExpenseController.createClaim);
router.put('/claims/:id', authenticateJWT, ExpenseController.updateClaim);
router.delete('/claims/:id', authenticateJWT, ExpenseController.deleteClaim);
router.put('/claims/:id/approve', authenticateJWT, ExpenseController.approveClaim);

// Reimbursements
router.get('/reimbursements', authenticateJWT, ExpenseController.listReimbursements);
router.put('/reimbursements/:id/process', authenticateJWT, ExpenseController.processReimbursement);

module.exports = router;
