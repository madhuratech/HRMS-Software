const express = require("express");
const router = express.Router();
const leavesController = require("../controllers/leavesController");

router.get("/dashboard-stats", leavesController.getDashboardStats);
router.get("/types", leavesController.getTypes);
router.post("/types", leavesController.createType);
router.put("/types/:id", leavesController.updateType);
router.delete("/types/:id", leavesController.deleteType);
router.get("/all-balances", leavesController.getAllBalances);
router.get("/balances/:employee_id", leavesController.getBalances);
router.get("/applications", leavesController.getApplications);
router.post("/applications", leavesController.submitApplication);
router.get("/comp-off", leavesController.getCompOffRequests);
router.post("/comp-off", leavesController.submitCompOffRequest);
router.put("/comp-off/:id/status", leavesController.updateCompOffStatus);

module.exports = router;
