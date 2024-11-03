const express = require('express');
const leaveController = require('../controllers/leaveController');
const {
  isAuthenticated,
  adminAndHrOnly,
} = require('../middlewares/permissionMiddlewar');
const router = express.Router();

// Apply for leave
router.post('/apply', isAuthenticated, leaveController.applyLeave);
router.put('/:id/approve', adminAndHrOnly, leaveController.approveLeave);
router.put('/:id/reject', adminAndHrOnly, leaveController.rejectLeave);
router.put(
  '/:id/update-status',
  adminAndHrOnly,
  leaveController.updateLeaveStatus
);

router.get(
  '/employee/:employeeId/history',
  isAuthenticated,
  leaveController.getLeaveHistory
);
router.get(
  '/employee/:employeeId/balance',
  isAuthenticated,
  leaveController.getLeaveBalance
);

router.get('/report', adminAndHrOnly, leaveController.generateLeaveReport);
router.get(
  '/employee/:employeeId/report',
  adminAndHrOnly,
  leaveController.generateLeaveReportByEmpId
);

module.exports = router;
