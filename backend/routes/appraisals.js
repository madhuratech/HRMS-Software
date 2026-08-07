const express = require("express");
const router = express.Router();
const appraisalController = require("../controllers/appraisalController");

router.get("/", appraisalController.getAppraisals);
router.post("/", appraisalController.createAppraisal);

module.exports = router;
