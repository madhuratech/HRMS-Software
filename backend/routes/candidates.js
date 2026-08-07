const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidateController");

router.get("/", candidateController.getCandidates);
router.post("/", candidateController.createCandidate);
router.put("/:id/stage", candidateController.updateStage);

module.exports = router;
