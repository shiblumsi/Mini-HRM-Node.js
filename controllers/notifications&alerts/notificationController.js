const { prisma } = require('../../DB/db.config');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.createSystemAnnouncement = catchAsync(async (req, res, next) => {
  const { title, message, targetGroup, departmentId, validUntil } = req.body;

  if (!title || !message || !targetGroup) {
    return next(
      new AppError('Title, message, and target group are required.', 400)
    );
  }

  const announcement = await prisma.systemAnnouncement.create({
    data: {
      title,
      message,
      targetGroup,
      validUntil: validUntil ? new Date(validUntil) : null,
      departmentId: departmentId || null,
    },
  });

  let employees = [];

  if (targetGroup === 'ALL_EMPLOYEES') {
    employees = await prisma.employee.findMany();
  } else if (targetGroup === 'HR') {
    employees = await prisma.hr.findMany();
  } else if (targetGroup === 'DEPARTMENT') {
    if (!departmentId) {
      return next(
        new AppError(
          'Please specify a departmentId for department-specific announcements.',
          400
        )
      );
    }
    employees = await prisma.employee.findMany({
      where: { departmentId },
    });

    if (employees.length === 0) {
      return next(
        new AppError(
          `No employees found for department ID ${departmentId}.`,
          404
        )
      );
    }
  } else {
    return next(new AppError('Invalid target group specified.', 400));
  }

  const notificationsData = employees.map((employee) => ({
    recipientId: employee.id,
    message: `New Announcement: ${title}`,
    type: 'SYSTEM_ALERT',
    status: 'PENDING',
  }));

  await prisma.notification.createMany({
    data: notificationsData,
  });

  return res.status(201).json({
    status: 'success',
    data: {
      announcement,
      employeesNotified: employees.length,
    },
  });
});
