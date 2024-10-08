const express = require('express');
const leaveController = require('../controllers/leaveController');
const router = express.Router();

// Apply for leave
router.post('/apply', leaveController.applyLeave);
router.put('/:id/approve', leaveController.approveLeave);
router.put('/:id/reject', leaveController.rejectLeave);
router.put('/:id/update-status', leaveController.updateLeaveStatus);

router.get('/employee/:employeeId/history', leaveController.getLeaveHistory);
router.get('/employee/:employeeId/balance', leaveController.getLeaveBalance);

router.get('/report', leaveController.generateLeaveReport);
router.get('/employee/:employeeId/report', leaveController.generateLeaveReportByEmpId);

module.exports = router;
