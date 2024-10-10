// notifications.js
const express = require('express');
const notificationsController = require('../../controllers/notifications&alerts/notificationController');
const alertsController = require('../controllers/alertsController');

const router = express.Router();

// Email Notifications
// router.post('/notifications/leave-approval', notificationsController.sendLeaveApproval);
// router.post('/notifications/task-assignment', notificationsController.sendTaskAssignment);
// router.post('/notifications/payroll', notificationsController.sendPayrollNotification);

// Alerts
router.post('/alerts/leave-expiration', alertsController.sendLeaveExpirationAlert);
router.post('/alerts/payroll-processing', alertsController.sendPayrollProcessingAlert);

// Internal Notifications
router.post('/notifications/internal', notificationsController.createInternalNotification);
router.get('/notifications/internal', notificationsController.getInternalNotifications);
router.patch('/notifications/internal/:id', notificationsController.markInternalNotificationAsRead);

// Notification Preferences
router.get('/notifications/preferences/:employeeId', notificationsController.getNotificationPreferences);
router.patch('/notifications/preferences/:employeeId', notificationsController.updateNotificationPreferences);

// Notification History
router.get('/notifications/history/:employeeId', notificationsController.getNotificationHistory);

module.exports = router;
