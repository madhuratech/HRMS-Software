const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/payrollController");

// 1. Listing & Personal
router.get("/", payrollController.list);
router.get("/payslips", payrollController.list);
router.get("/my-payroll", payrollController.getMyPayroll);

// 2. Generation & Bulk Actions
router.post("/generate", payrollController.generate);
router.post("/bulk-approve", payrollController.bulkApprove);
router.post("/bulk-mark-paid", payrollController.bulkMarkPaid);

// 3. Salary Structures
router.get("/structures", payrollController.getStructures);
router.get("/structures/:id", payrollController.getStructureById);
router.post("/structures", payrollController.createStructure);
router.put("/structures/:id", payrollController.updateStructure);
router.delete("/structures/:id", payrollController.deleteStructure);
router.post("/structures/assign", payrollController.assignStructure);

// 4. Salary Components
router.get("/components", payrollController.getComponents);
router.post("/components", payrollController.createComponent);
router.put("/components/:id", payrollController.updateComponent);
router.delete("/components/:id", payrollController.deleteComponent);

// 5. Bonuses & Incentives
router.get("/bonuses", payrollController.getBonuses);
router.post("/bonuses", payrollController.createBonus);
router.put("/bonuses/:id/status", payrollController.updateBonusStatus);

// 6. Expense Reimbursements
router.get("/reimbursements", payrollController.getReimbursements);
router.post("/reimbursements", payrollController.createReimbursement);
router.put("/reimbursements/:id/status", payrollController.updateReimbursementStatus);

// 7. Loans & Advances
router.get("/loans", payrollController.getLoans);
router.post("/loans", payrollController.createLoan);
router.put("/loans/:id/status", payrollController.updateLoanStatus);

// 8. Tax Management
router.get("/taxes", payrollController.getTaxes);
router.post("/taxes", payrollController.createTax);
router.put("/taxes/:id/verify", payrollController.verifyTax);

// 9. Runs & Reports
router.get("/runs", payrollController.getRuns);
router.post("/runs", payrollController.initializeRun);
router.get("/reports", payrollController.getReports);

// 10. Individual Record Actions (Parameterized :id at the bottom to prevent route collisions)
router.get("/:id", payrollController.getById);
router.put("/:id", payrollController.update);
router.post("/:id/approve", payrollController.approve);
router.post("/:id/mark-paid", payrollController.markPaid);
router.get("/:id/payslip", payrollController.getPayslip);
router.get("/:id/download-pdf", payrollController.downloadPayslipPdf);
router.get("/:id/pdf", payrollController.downloadPayslipPdf);

module.exports = router;
