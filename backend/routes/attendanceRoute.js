const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { authenticateJWT } = require("../middlewares/auth");

// Standard attendance endpoints
router.post("/punch", authenticateJWT, attendanceController.punch);
router.get("/today-status", authenticateJWT, attendanceController.getTodayStatus);
router.get("/recent/:employee_id", authenticateJWT, attendanceController.getRecent);
router.get("/daily", authenticateJWT, attendanceController.getDailyStats);
router.get("/gps-feed", authenticateJWT, attendanceController.getGPSFeed);

// Location Master CRUD (Admin only or authorized roles could be checked via role check if needed, but JWT check is core security)
router.get("/punch-locations", authenticateJWT, attendanceController.getPunchLocations);
router.get("/punch-locations/:id", authenticateJWT, attendanceController.getPunchLocationById);
router.post("/punch-locations", authenticateJWT, attendanceController.createPunchLocation);
router.put("/punch-locations/:id", authenticateJWT, attendanceController.updatePunchLocation);
router.delete("/punch-locations/:id", authenticateJWT, attendanceController.deletePunchLocation);
router.patch("/punch-locations/:id/status", authenticateJWT, attendanceController.togglePunchLocationStatus);

// Reports & Export
router.get("/reports", authenticateJWT, attendanceController.getGPSReport);
router.get("/reports/pdf", authenticateJWT, attendanceController.exportGPSReportPDF);
router.get("/reports/excel", authenticateJWT, attendanceController.exportGPSReportExcel);

module.exports = router;
