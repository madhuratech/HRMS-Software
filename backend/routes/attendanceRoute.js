const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.post("/punch", attendanceController.punch);
router.get("/recent/:employee_id", attendanceController.getRecent);

module.exports = router;
