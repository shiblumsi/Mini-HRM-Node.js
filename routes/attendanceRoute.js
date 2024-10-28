const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const router = express.Router();

// Route for recording attendance
router.post('/record', attendanceController.recordAttendance);
router.get('/:id', attendanceController.getAttendanceById);
router.patch('/:id/update/checkout', attendanceController.updateCheckOut);
router.get('/', attendanceController.getAttendanceByDate);
router.get('/reports/monthly', attendanceController.generateMonthlyAttendanceReport);
router.get('/overtime', attendanceController.overtimeAndLateAraivals);
router.delete('/:id/delete', attendanceController.deleteAttendance);
router.get('/summary', attendanceController.getEmployeeAttendanceSummary);

module.exports = router;
