const express = require("express");
const router = express.Router();
const leavesController = require("../controllers/leavesController");

router.get("/types", leavesController.getTypes);
router.get("/balances/:employee_id", leavesController.getBalances);
router.get("/applications", leavesController.getApplications);
router.post("/applications", leavesController.submitApplication);
router.put("/applications/:id", leavesController.updateStatus);

module.exports = router;
