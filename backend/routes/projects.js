const express = require("express");
const router = express.Router();
const projectsController = require("../controllers/projectsController");

router.get("/", projectsController.getProjects);
router.post("/", projectsController.createProject);
router.get("/tasks", projectsController.getTasks);
router.post("/tasks", projectsController.createTask);

module.exports = router;
