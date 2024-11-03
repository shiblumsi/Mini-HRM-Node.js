const express = require('express');
const jobApplicationController = require('../../controllers/recruitment/applicationController');
const upload = require('../../utils/applicationMulter');
const { adminAndHrOnly } = require('../../middlewares/permissionMiddlewar');

const router = express.Router();

router
  .route('/job/:jobId/application')
  .post(upload, jobApplicationController.submitJobApplication)
  .get(adminAndHrOnly, jobApplicationController.getApplicationsForJob);

router.use(adminAndHrOnly);
router
  .route('/:applicationId')
  .get(jobApplicationController.getApplicationById)
  .put(jobApplicationController.updateJobApplication)
  .delete(jobApplicationController.deleteJobApplication);

module.exports = router;
