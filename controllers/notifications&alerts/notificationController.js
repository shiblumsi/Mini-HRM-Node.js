// controllers/notificationsController.js
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { prisma } = require('../../DB/db.config');

// // Send Leave Approval Notification
// exports.sendLeaveApproval = catchAsync(async (req, res, next) => {
//   const { employeeId, message } = req.body;

//   // Create email notification logic here
//   const notification = await prisma.notification.create({
//     data: {
//       type: 'EMAIL',
//       recipientId: employeeId,
//       message,
//       // other required fields
//     },
//   });

//   if (!notification) {
//     return next(new AppError('Failed to send leave approval notification', 500));
//   }

//   res.status(201).json({ status: 'success', data: notification });
// });

// // Send Task Assignment Notification
// exports.sendTaskAssignment = catchAsync(async (req, res, next) => {
//   const { employeeId, message } = req.body;

//   const notification = await prisma.notification.create({
//     data: {
//       type: 'EMAIL',
//       recipientId: employeeId,
//       message,
//       // other required fields
//     },
//   });

//   if (!notification) {
//     return next(new AppError('Failed to send task assignment notification', 500));
//   }

//   res.status(201).json({ status: 'success', data: notification });
// });

// // Send Payroll Notification
// exports.sendPayrollNotification = catchAsync(async (req, res, next) => {
//   const { employeeId, message } = req.body;

//   const notification = await prisma.notification.create({
//     data: {
//       type: 'EMAIL',
//       recipientId: employeeId,
//       message,
//       // other required fields
//     },
//   });

//   if (!notification) {
//     return next(new AppError('Failed to send payroll notification', 500));
//   }

//   res.status(201).json({ status: 'success', data: notification });
// });

// Create Internal Notification
exports.createInternalNotification = catchAsync(async (req, res, next) => {
  const { recipientId, message } = req.body;

  const notification = await prisma.notification.create({
    data: {
      type: 'INTERNAL',
      recipientId,
      message,
      // other required fields
    },
  });

  if (!notification) {
    return next(new AppError('Failed to create internal notification', 500));
  }

  res.status(201).json({ status: 'success', data: notification });
});

// Get Internal Notifications
exports.getInternalNotifications = catchAsync(async (req, res, next) => {
  const notifications = await prisma.notification.findMany({
    where: { type: 'INTERNAL' },
  });

  res.status(200).json({ status: 'success', data: notifications });
});

// Mark Internal Notification as Read
exports.markInternalNotificationAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const notification = await prisma.notification.update({
    where: { id: Number(id) },
    data: { readAt: new Date() },
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({ status: 'success', data: notification });
});

// Get Notification Preferences
exports.getNotificationPreferences = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  const preferences = await prisma.notificationPreferences.findUnique({
    where: { employeeId: Number(employeeId) },
  });

  if (!preferences) {
    return next(new AppError('Notification preferences not found', 404));
  }

  res.status(200).json({ status: 'success', data: preferences });
});

// Update Notification Preferences
exports.updateNotificationPreferences = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;
  const { preferences } = req.body;

  const updatedPreferences = await prisma.notificationPreferences.update({
    where: { employeeId: Number(employeeId) },
    data: preferences,
  });

  res.status(200).json({ status: 'success', data: updatedPreferences });
});

// Get Notification History
exports.getNotificationHistory = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  const history = await prisma.notification.findMany({
    where: { recipientId: Number(employeeId) },
  });

  res.status(200).json({ status: 'success', data: history });
});
