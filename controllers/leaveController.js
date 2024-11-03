const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/sendMail');

exports.applyLeave = catchAsync(async (req, res, next) => {
  const { leaveTypeId, startDate, endDate } = req.body;

  const employee = await prisma.employee.findUnique({
    where: { userId: req.user.id },
  });
  const employeeId = employee.id;
  console.log(employeeId);

  if (!leaveTypeId || !startDate || !endDate) {
    return next(new AppError('All fields are required', 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return next(
      new AppError('Invalid date format. Please use YYYY-MM-DD.', 400)
    );
  }

  const totalDaysRequested =
    Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const leaveType = await prisma.leaveType.findUnique({
    where: { id: leaveTypeId },
  });

  if (!leaveType) {
    return next(new AppError('Leave type not found', 404));
  }
  const isPending = await prisma.leave.findMany({
    where: {
      employeeId: Number(employeeId),
      status: 'PENDING',
    },
  });

  if (isPending.length > 0) {
    return next(
      new AppError('You already have a leave request in "PENDING" status', 400)
    );
  }

  const approvedLeaves = await prisma.leave.findMany({
    where: {
      employeeId: Number(employeeId),
      leaveTypeId: leaveTypeId,
      status: 'APPROVED',
    },
  });

  let totalDaysTaken = 0;
  approvedLeaves.forEach((leave) => {
    totalDaysTaken += leave.totalDays;
  });

  const remainingDays = leaveType.maxDays - totalDaysTaken;
  if (totalDaysRequested > remainingDays) {
    return next(
      new AppError(
        `You only have ${remainingDays} remaining ${leaveType.name} days, but you requested ${totalDaysRequested} days.`,
        400
      )
    );
  }

  const newLeave = await prisma.leave.create({
    data: {
      employeeId,
      leaveTypeId,
      startDate: start,
      endDate: end,
      totalDays: totalDaysRequested,
      status: 'PENDING',
    },
  });

  res.status(201).json({
    status: 'success',
    data: newLeave,
  });
});

// Approve a leave with email notification
exports.approveLeave = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { approvedBy } = req.body;

  const leave = await prisma.leave.findUnique({
    where: { id: Number(id) },
    include: {
      employee: {
        include: {
          user: { select: { email: true } },
        },
      },
    },
  });

  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  if (leave.status !== 'PENDING') {
    return next(new AppError('Leave request is already processed', 400));
  }

  const approvedLeave = await prisma.leave.update({
    where: { id: Number(id) },
    data: {
      status: 'APPROVED',
      approvedBy,
      approvalDate: new Date(),
    },
  });

  await prisma.alert.create({
    data: {
      eventType: 'LEAVE_APPROVAL',
      message: `Your leave request from ${leave.startDate} to ${leave.endDate} has been approved.`,
      recipientId: leave.employeeId,
    },
  });

  const email = leave.employee.user.email;

  if (!email) {
    return next(new AppError('Employee email not found', 400));
  }

  const notification = await prisma.notification.create({
    data: {
      type: 'EMAIL',
      recipientId: leave.employeeId,
      message: `Your leave request from ${leave.startDate} to ${leave.endDate} has been approved.`,
      status: 'PENDING',
    },
  });

  // Send the email notification
  await sendEmail({
    to: email,
    subject: 'Leave Approval Notification',
    text: notification.message,
  });

  res.json({
    status: 'success',
    message: 'Leave request approved, alert created, and notification sent.',
    data: approvedLeave,
  });
});

// Reject a leave
exports.rejectLeave = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const leave = await prisma.leave.findUnique({
    where: { id: Number(id) },
  });

  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  if (leave.status !== 'PENDING') {
    return next(new AppError('Leave request is already processed', 400));
  }

  const rejectedLeave = await prisma.leave.update({
    where: { id: Number(id) },
    data: {
      status: 'REJECTED',
      cancellationDate: new Date(),
    },
  });

  res.json({
    status: 'success',
    message: 'Leave request rejected successfully',
    data: rejectedLeave,
  });
});

// Update leave status (approve/reject)
exports.updateLeaveStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new AppError('Leave ID is required', 400));
  }

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return next(
      new AppError('Invalid status. Use "APPROVED" or "REJECTED".', 400)
    );
  }

  const leave = await prisma.leave.findUnique({
    where: { id: Number(id) },
  });

  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  const updateData = { status, updatedAt: new Date() };

  if (status === 'APPROVED') {
    updateData.approvedBy = 'admin';
    updateData.approvalDate = new Date();
  } else if (status === 'REJECTED') {
    updateData.cancellationDate = new Date();
  }

  // Update the leave request
  const updatedLeave = await prisma.leave.update({
    where: { id: Number(id) },
    data: updateData,
  });

  res.status(200).json({
    status: 'success',
    message: `Leave request ${status.toLowerCase()} successfully`,
    data: updatedLeave,
  });
});

// Retrieve leave history for a specific employee
exports.getLeaveHistory = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;
  console.log(employeeId);

  if (!employeeId) {
    return next(new AppError('Employee ID is required', 400));
  }

  const leaveHistory = await prisma.leave.findMany({
    where: { employeeId: Number(employeeId) },
    include: { type: true },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    data: leaveHistory,
  });
});

exports.getLeaveBalance = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  const employee = await prisma.employee.findUnique({
    where: { id: Number(employeeId) },
    select: {
      firstName: true,
      user: {
        select: {
          email: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!employeeId) {
    return next(new AppError('Employee ID is required', 400));
  }

  const leaveTypes = await prisma.leaveType.findMany();

  const leaveBalance = {};

  for (const leaveType of leaveTypes) {
    const approvedLeaves = await prisma.leave.findMany({
      where: {
        employeeId: Number(employeeId),
        leaveTypeId: leaveType.id,
        status: 'APPROVED',
      },
    });

    let totalDaysTaken = 0;

    for (const leave of approvedLeaves) {
      totalDaysTaken += leave.totalDays;
    }

    const remaining = leaveType.maxDays - totalDaysTaken;

    leaveBalance[leaveType.name] = {
      maxDays: leaveType.maxDays,
      taken: totalDaysTaken,
      remaining: remaining,
    };
  }

  res.status(200).json({
    status: 'success',
    employee: employee,
    data: leaveBalance,
  });
});

// Generate leave reports
exports.generateLeaveReport = catchAsync(async (req, res, next) => {
  try {
    const leaveReports = await prisma.leave.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const leaveBalances = await prisma.leaveType.findMany({
      include: {
        leaves: {
          where: {
            status: 'APPROVED',
          },
        },
      },
    });

    const reportData = leaveReports.map((report) => ({
      status: report.status,
      count: report._count.id,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        report: reportData,
        leaveBalances,
      },
    });
  } catch (error) {
    return next(new AppError('Error generating leave report', 500));
  }
});

// Generate leave reports by employee ID
exports.generateLeaveReportByEmpId = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  try {
    const leaveReports = await prisma.leave.groupBy({
      where: { employeeId: Number(employeeId) },
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const leaveBalances = await prisma.leaveType.findMany({
      include: {
        leaves: {
          where: {
            employeeId: Number(employeeId),
            status: 'APPROVED',
          },
        },
      },
    });

    const reportData = leaveReports.map((report) => ({
      status: report.status,
      count: report._count.id,
    }));

    const balanceData = leaveBalances.map((leaveType) => {
      const totalTaken = leaveType.leaves.reduce(
        (sum, leave) => sum + leave.totalDays,
        0
      );
      return {
        leaveType: leaveType.name,
        maxDays: leaveType.maxDays,
        taken: totalTaken,
        remaining: leaveType.maxDays - totalTaken,
      };
    });

    res.status(200).json({
      status: 'success',
      employeeId,
      data: {
        report: reportData,
        leaveBalances: balanceData,
      },
    });
  } catch (error) {
    return next(new AppError('Error generating leave report', 500));
  }
});
