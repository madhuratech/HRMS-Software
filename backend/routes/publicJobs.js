const express = require('express');

const router = express.Router();

const PublicJobsController =
    require('../controllers/PublicJobsController');

const upload =
    require('../utils/fileUpload');


/*
|--------------------------------------------------------------------------
| PUBLIC CAREER API
|--------------------------------------------------------------------------
*/


// GET ALL ACTIVE JOBS
router.get(
    '/',
    PublicJobsController.listJobs
);


// GET SINGLE JOB
router.get(
    '/:slug',
    PublicJobsController.getJobDetails
);


// APPLY FOR JOB
router.post(
    '/:jobId/apply',
    upload.single('resume'),
    PublicJobsController.applyForJob
);


module.exports = router;