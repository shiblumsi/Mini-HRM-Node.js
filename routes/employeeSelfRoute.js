const express = require('express');
const selfController = require('../controllers/employeeSelfController');
const upload = require('../utils/multer');
const { employeeOnly } = require('../middlewares/permissionMiddlewar');

const router = express.Router();

router.use(employeeOnly);

router.get('/view-attendance', selfController.viewAttendance);
router.get(
  '/view-attendance-summary',
  selfController.viewMonthlyAttendanceSummary
);

router.post('/apply-leave', selfController.applyForLeave);
router.get('/view-leave-status', selfController.viewLeaveStatus);
router.put('/cancle-leave', selfController.cancelLeave);
router.get('/remaining-leaves', selfController.remainingLeaves);

router.get('/profile', selfController.viewProfile);
router.patch('/profile', selfController.updateProfile);
router.patch(
  '/profile/picture',
  upload.single('image'),
  selfController.updateProfilePicture
);

router.get('/view-task', selfController.viewAssignedTasks);
router.patch('/submit-task', selfController.submitTaskUpdate);
router.get('/task/:taskId/performance', selfController.viewPerformanceReports);

router.get('/view-paySlip', selfController.viewPayslip);
router.get('/view-viewSalaryDetails', selfController.viewSalaryDetails);

router.get('/view-notifications', selfController.viewNotifications);
router.get('/view-systemAnnouncements', selfController.viewSystemAnnouncements);

router.get('/view-holidayCalendar', selfController.viewHolidayCalendar);

module.exports = router;
