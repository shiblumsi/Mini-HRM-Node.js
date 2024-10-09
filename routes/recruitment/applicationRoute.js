const express = require('express');
const jobApplicationController = require('../../controllers/recruitment/applicationController');
const upload = require('../../utils/applicationMulter');

const router = express.Router();

router
  .route('/job/:jobId/application')
  .post(upload, jobApplicationController.submitJobApplication)
  .get(jobApplicationController.getApplicationsForJob);

router
  .route('/:applicationId')
  .get(jobApplicationController.getApplicationById)
  .put(jobApplicationController.updateJobApplication)
  .delete(jobApplicationController.deleteJobApplication);

module.exports = router;
