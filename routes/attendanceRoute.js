const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const router = express.Router();

// Route for recording attendance
router.post('/record', attendanceController.recordAttendance);
router.get('/', attendanceController.getAttendanceByDate);
router.get('/reports/monthly', attendanceController.generateMonthlyReports);

module.exports = router;
