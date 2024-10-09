const express = require('express');
const performanceController = require('../../controllers/task&performance/performanceController');
const router = express.Router();

// Performance evaluation routes
router
  .route('/')
  .post(performanceController.createPerformanceEvaluation)
  .get(performanceController.getAllPerformanceEvaluation);

router.get('/generate', performanceController.generatePerformanceReports);

router.route('/:id').put(performanceController.updatePerformanceEvaluation);

router.get(
  '/employee/:employeeId',
  performanceController.getPerformanceEvaluationsByEmployee
);

router.get(
  '/report/:employeeId',
  performanceController.getPerformanceReportByEmployee
);

module.exports = router;
