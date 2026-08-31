const express = require('express');
const router = express.Router();
const PublicJobsController = require('../controllers/PublicJobsController');
const upload = require('../utils/fileUpload');

// Public Endpoints (No JWT authentication required)
router.get('/', PublicJobsController.listJobs);
router.get('/:slug', PublicJobsController.getJobDetails);
router.post('/:jobId/apply', upload.single('resume'), PublicJobsController.applyForJob);

module.exports = router;
