const express = require('express');
const {
  getAttendanceReports,
  getAttendanceReportByEmployeeId,
  getPayrollReports,
  getPayrollReportByEmployeeId,
  getLeaveReports,
  getLeaveReportByEmployeeId,
  getPerformanceReports,
  getPerformanceReportByEmployeeId,
  getDashboardOverview,
  createCustomReport,
  generateAttendanceReport,
  generateLeaveReport,
  generatePayrollReport,
  generatePerformanceReport,
} = require('../controllers/reportController');


const router = express.Router();


// Attendance Reports
router.post('/generate/attendance', generateAttendanceReport);
router.get('/attendance', getAttendanceReports);
router.get('/attendance/employee/:employeeId', getAttendanceReportByEmployeeId);

// Payroll Reports
router.post('/generate/payroll', generatePayrollReport);
router.get('/payroll', getPayrollReports);
router.get('/payroll/employee/:employeeId', getPayrollReportByEmployeeId);

// Leave Reports

router.post('/generate/leave', generateLeaveReport); // Generate leave report
router.get('/leave', getLeaveReports);
router.get('/leave/:employeeId', getLeaveReportByEmployeeId);

// Performance Reports
router.post('/generate/performance', generatePerformanceReport); 
router.get('/performance', getPerformanceReports);
router.get('/performance/:employeeId', getPerformanceReportByEmployeeId);

// Dashboard Overview
router.get('/dashboard', getDashboardOverview);

// Custom Report
// router.post('/custom', createCustomReport);





module.exports = router;
