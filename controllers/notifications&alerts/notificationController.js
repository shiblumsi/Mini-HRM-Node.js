
const { prisma } = require('../../DB/db.config');
const AppError = require('../../utils/appError'); 
const catchAsync = require('../../utils/catchAsync');


exports.createSystemAnnouncement = catchAsync(async (req, res, next) => {
  const { title, message, targetGroup, departmentId, validUntil } = req.body;

  // Check if required fields are provided
  if (!title || !message || !targetGroup) {
    return next(new AppError('Title, message, and target group are required.', 400));
  }

  // Create a new system announcement
  const announcement = await prisma.systemAnnouncement.create({
    data: {
      title,
      message,
      targetGroup,
      validUntil: validUntil ? new Date(validUntil) : null, // Convert to Date object if provided
      departmentId: departmentId || null, // Use null if not provided
    },
  });

  // Determine the recipients based on the target group
  let employees = [];

  if (targetGroup === 'ALL_EMPLOYEES') {
    employees = await prisma.employee.findMany();
  } else if (targetGroup === 'HR') {
    employees = await prisma.hr.findMany(); // Get all HR personnel
  } else if (targetGroup === 'DEPARTMENT') {
    if (!departmentId) {
      return next(new AppError('Please specify a departmentId for department-specific announcements.', 400));
    }
    employees = await prisma.employee.findMany({
      where: { departmentId },
    });

    if (employees.length === 0) {
      return next(new AppError(`No employees found for department ID ${departmentId}.`, 404));
    }
  } else {
    return next(new AppError('Invalid target group specified.', 400));
  }

  // Prepare bulk create data for notifications
  const notificationsData = employees.map(employee => ({
    recipientId: employee.id,
    message: `New Announcement: ${title}`,
    type: 'SYSTEM_ALERT',
    status: 'PENDING',
  }));

  // Bulk create notifications
  await prisma.notification.createMany({
    data: notificationsData,
  });

  // Send response back
  return res.status(201).json({
    status: 'success',
    data: {
      announcement,
      employeesNotified: employees.length,
    },
  });
});

