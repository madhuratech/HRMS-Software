const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/payrollController");

router.get("/", payrollController.getMyPayroll);
router.get("/payslips", payrollController.getPayslips);
router.get("/structures", payrollController.getStructures);
router.post("/structures", payrollController.createStructure);
router.get("/components", payrollController.getComponents);
router.post("/components", payrollController.createComponent);
router.get("/runs", payrollController.getRuns);
router.post("/runs", payrollController.initializeRun);
router.get("/reports", payrollController.getReports);
router.get("/bonuses", payrollController.getBonuses);

module.exports = router;
