const express = require('express');
const jobController = require('../../controllers/recruitment/jobsController');
const router = express.Router();

router
  .route('/')
  .post(jobController.createJobOpening)
  .get(jobController.getAllJobOpenings);

router
  .route('/:jobId')
  .get(jobController.getJobOpeningById)
  .put(jobController.updateJobOpening)
  .delete(jobController.deleteJobOpening);

module.exports = router;
