// routes/interviewRoutes.js
const express = require('express');
const interviewController = require('../../controllers/recruitment/interviewController');
const router = express.Router();

router.post('/', interviewController.createInterview);

router.get('/', interviewController.getAllInterviews);

router.get('/:id', interviewController.getInterviewById);

router.patch('/:id', interviewController.updateInterview);

router.delete('/:id', interviewController.deleteInterview);

router.get(
  '/job-application/:jobApplicationId',
  interviewController.getInterviewsByJobApplicationId
);

module.exports = router;
