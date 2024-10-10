const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/sendMail');

exports.applyLeave = catchAsync(async (req, res, next) => {
  const { employeeId, leaveTypeId, startDate, endDate } = req.body;

  // Validate input
  if (!employeeId || !leaveTypeId || !startDate || !endDate) {
    return next(new AppError('All fields are required', 400));
  }

  // Convert startDate and endDate strings to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return next(
      new AppError('Invalid date format. Please use YYYY-MM-DD.', 400)
    );
  }

  // Calculate total days for the leave
  const totalDaysRequested =
    Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Get the leave type to check maxDays
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

  // Check if any pending leaves exist
  if (isPending.length > 0) {
    return next(
      new AppError('You already have a leave request in "PENDING" status', 400)
    );
  }
  // Calculate total approved days taken by the employee for this leave type
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

  // Check if the requested leave exceeds the remaining balance
  const remainingDays = leaveType.maxDays - totalDaysTaken;
  if (totalDaysRequested > remainingDays) {
    return next(
      new AppError(
        `You only have ${remainingDays} remaining ${leaveType.name} days, but you requested ${totalDaysRequested} days.`,
        400
      )
    );
  }

  // Apply for the leave if validation passes
  const newLeave = await prisma.leave.create({
    data: {
      employeeId,
      leaveTypeId,
      startDate: start, // Use the converted Date object
      endDate: end, // Use the converted Date object
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
  const { approvedBy } = req.body; // User who approved the leave

  // Find the leave request
  const leave = await prisma.leave.findUnique({
    where: { id: Number(id) },
    include: {
      employee: {
        include: {
          user: { select: { email: true } }, // Include the user's email
        },
      },
    },
  });

  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  // Check if the leave is already approved or rejected
  if (leave.status !== 'PENDING') {
    return next(new AppError('Leave request is already processed', 400));
  }

  // Update leave status to 'APPROVED'
  const approvedLeave = await prisma.leave.update({
    where: { id: Number(id) },
    data: {
      status: 'APPROVED',
      approvedBy,
      approvalDate: new Date(),
    },
  });
  // Create alert
  await prisma.alert.create({
    data: {
      eventType: 'LEAVE_APPROVAL',
      message: `Your leave request from ${leave.startDate} to ${leave.endDate} has been approved.`,
      recipientId: leave.employeeId,
    },
  });
  // Ensure the employee's user email exists
  const email = leave.employee.user.email;
  console.log('kbsbldjfbkjdlsb', email);

  if (!email) {
    return next(new AppError('Employee email not found', 400));
  }

  // Create an email notification in the database
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
    to: email, // Employee's user email
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

  // Find the leave request
  const leave = await prisma.leave.findUnique({
    where: { id: Number(id) },
  });

  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  // Check if the leave is already approved or rejected
  if (leave.status !== 'PENDING') {
    return next(new AppError('Leave request is already processed', 400));
  }

  // Update leave status to 'REJECTED'
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

  // Ensure status is provided and valid
  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return next(
      new AppError('Invalid status. Use "APPROVED" or "REJECTED".', 400)
    );
  }

  // Find the leave request by ID
  const leave = await prisma.leave.findUnique({
    where: { id: Number(id) },
  });

  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  // Prepare data for update based on status
  const updateData = { status, updatedAt: new Date() };

  if (status === 'APPROVED') {
    updateData.approvedBy = 'admin';
    updateData.approvalDate = new Date(); // Approval date is set to now
  } else if (status === 'REJECTED') {
    updateData.cancellationDate = new Date(); // Rejection date is set to now
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

  // Validate employee ID
  if (!employeeId) {
    return next(new AppError('Employee ID is required', 400));
  }

  // Retrieve leave history for the specified employee
  const leaveHistory = await prisma.leave.findMany({
    where: { employeeId: Number(employeeId) },
    include: { type: true }, // Include leave type details
    orderBy: { createdAt: 'desc' }, // Optional: order by creation date
  });

  res.status(200).json({
    status: 'success',
    data: leaveHistory,
  });
});

exports.getLeaveBalance = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  // Validate employee ID
  if (!employeeId) {
    return next(new AppError('Employee ID is required', 400));
  }

  // Retrieve all leave types
  const leaveTypes = await prisma.leaveType.findMany();

  // Initialize leave balance object
  const leaveBalance = {};

  // Loop through each leave type to calculate balance
  for (const leaveType of leaveTypes) {
    // Get all approved leaves for this employee and leave type
    const approvedLeaves = await prisma.leave.findMany({
      where: {
        employeeId: Number(employeeId),
        leaveTypeId: leaveType.id,
        status: 'APPROVED', // Count only approved leaves
      },
    });

    // Initialize totalDaysTaken to 0
    let totalDaysTaken = 0;

    // Loop through each leave and add up totalDays
    for (const leave of approvedLeaves) {
      totalDaysTaken += leave.totalDays;
    }

    // Calculate remaining days (can be negative if more leave taken than allowed)
    const remaining = leaveType.maxDays - totalDaysTaken;

    // Update the leave balance, allowing negative remaining days
    leaveBalance[leaveType.name] = {
      maxDays: leaveType.maxDays,
      taken: totalDaysTaken,
      remaining: remaining, // This can be negative
    };
  }

  res.status(200).json({
    status: 'success',
    data: leaveBalance,
  });
});

// Generate leave reports
exports.generateLeaveReport = catchAsync(async (req, res, next) => {
  try {
    // Fetch leave counts based on their status
    const leaveReports = await prisma.leave.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Optional: Fetch leave balances for each employee (if needed)
    const leaveBalances = await prisma.leaveType.findMany({
      include: {
        leaves: {
          where: {
            status: 'APPROVED', // Or any specific status you want
          },
        },
      },
    });

    // Structure the report data
    const reportData = leaveReports.map((report) => ({
      status: report.status,
      count: report._count.id,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        report: reportData,
        leaveBalances, // Include leave balances if needed
      },
    });
  } catch (error) {
    return next(new AppError('Error generating leave report', 500));
  }
});

// Generate leave reports by employee ID
exports.generateLeaveReportByEmpId = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params; // Get employeeId from request parameters

  try {
    // Fetch leave counts based on their status for a specific employee
    const leaveReports = await prisma.leave.groupBy({
      where: { employeeId: Number(employeeId) }, // Filter by employeeId
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Fetch leave balances for the specific employee
    const leaveBalances = await prisma.leaveType.findMany({
      include: {
        leaves: {
          where: {
            employeeId: Number(employeeId), // Filter by employeeId
            status: 'APPROVED', // Or any specific status you want
          },
        },
      },
    });

    // Structure the report data
    const reportData = leaveReports.map((report) => ({
      status: report.status,
      count: report._count.id,
    }));

    // Calculate balances for each leave type
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
        leaveBalances: balanceData, // Include leave balances
      },
    });
  } catch (error) {
    return next(new AppError('Error generating leave report', 500));
  }
});
