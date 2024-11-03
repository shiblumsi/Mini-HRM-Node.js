const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { prisma } = require('../DB/db.config');

// View individual attendance records
exports.viewAttendance = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { month, year } = req.query;

  const employee = await prisma.employee.findUnique({
    where: {
      userId: id,
    },
  });
  const employeeId = employee.id;

  const currentDate = new Date();
  const queryMonth = month
    ? month.padStart(2, '0')
    : String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
  const queryYear = year ? parseInt(year, 10) : currentDate.getFullYear();

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      employeeId,
      month: queryMonth,
      year: queryYear,
    },
    orderBy: { attendanceDate: 'asc' },
    select: {
      attendanceDate: true,
      checkIn: true,
      checkOut: true,
      workHoure: true,
    },
  });

  if (!attendanceRecords || attendanceRecords.length === 0) {
    return next(
      new AppError(
        `No attendance records found for ${queryMonth}/${queryYear}`,
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    results: attendanceRecords.length,
    data: {
      attendanceRecords,
    },
  });
});

// View monthly attendance summary for an employee
exports.viewMonthlyAttendanceSummary = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  let { month, year } = req.query;

  const employee = await prisma.employee.findUnique({
    where: {
      userId: id,
    },
  });
  const employeeId = employee.id;

  const currentDate = new Date();
  month = month
    ? month.padStart(2, '0')
    : String(currentDate.getMonth() + 1).padStart(2, '0');
  year = year ? parseInt(year, 10) : currentDate.getFullYear();

  const holiday = await prisma.holiday.findMany({
    where: {
      month,
      year,
    },
  });

  const monthlyAttendance = await prisma.attendance.findMany({
    where: {
      employeeId,
      month,
      year,
    },
  });

  if (!monthlyAttendance.length) {
    return next(
      new AppError(`No attendance records found for ${month}/${year}`, 404)
    );
  }

  const totalDaysPresent = monthlyAttendance.filter(
    (record) => record.isPresent
  ).length;
  const totalDaysAbsent = monthlyAttendance.length - totalDaysPresent;
  const totalLateArrivals = monthlyAttendance.filter(
    (record) => record.lateArrival
  ).length;

  let totalWorkHours = 0;
  for (const record of monthlyAttendance) {
    if (record.workHoure) {
      totalWorkHours += record.workHoure;
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      month,
      year,
      totalDaysPresent,
      totalDaysAbsent: totalDaysAbsent - holiday.length,
      totalWorkHours,
      totalLateArrivals,
    },
  });
});

// Apply for leave
exports.applyForLeave = catchAsync(async (req, res, next) => {
  const { id } = req.user; // Assume employeeId comes from authenticated user info (JWT payload)
  const { leaveTypeId, startDate, endDate } = req.body;

  const employee = await prisma.employee.findUnique({
    where: {
      userId: id,
    },
  });
  const employeeId = employee.id;

  // Ensure required fields are provided
  if (!leaveTypeId || !startDate) {
    return next(new AppError('Please provide leaveTypeId and startDate', 400));
  }

  // Set endDate to startDate for single-day leave requests
  const leaveEndDate = endDate ? new Date(endDate) : new Date(startDate);

  // Check for overlapping leave requests
  const existingLeave = await prisma.leave.findFirst({
    where: {
      employeeId,
      OR: [
        {
          startDate: { lte: leaveEndDate },
          endDate: { gte: new Date(startDate) },
        },
      ],
    },
  });

  if (existingLeave) {
    return next(
      new AppError('You already have a leave request for this period', 400)
    );
  }

  // Calculate total days
  const totalDays =
    (leaveEndDate - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;

  // Create the leave request
  const newLeave = await prisma.leave.create({
    data: {
      employeeId,
      leaveTypeId,
      startDate: new Date(startDate),
      endDate: leaveEndDate,
      totalDays,
      status: 'PENDING',
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      leave: newLeave,
    },
  });
});

// View leave status
exports.viewLeaveStatus = catchAsync(async (req, res, next) => {
  const { leaveId } = req.query;

  const leaveRequests = await prisma.leave.findUnique({
    where: { id: leaveId * 1 },
    select: {
      status: true,
    },
  });

  if (!leaveRequests || leaveRequests.length === 0) {
    return next(new AppError('No leave requests found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: leaveRequests.length,
    data: {
      leave: leaveRequests,
    },
  });
});

// Cancel leave
exports.cancelLeave = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { leaveId } = req.body;

  const employee = await prisma.employee.findUnique({
    where: {
      userId: id,
    },
  });
  const employeeId = employee.id;

  if (!leaveId) {
    return next(new AppError('Please provide a leave ID', 400));
  }

  const leaveRequest = await prisma.leave.findUnique({
    where: { id: leaveId },
  });

  if (!leaveRequest) {
    return next(new AppError('Leave request not found', 404));
  }

  if (
    leaveRequest.employeeId !== employeeId ||
    leaveRequest.status !== 'PENDING'
  ) {
    return next(
      new AppError('You can only cancel pending leave requests', 403)
    );
  }

  const updatedLeave = await prisma.leave.update({
    where: { id: leaveId },
    data: { status: 'CANCELED', cancellationDate: new Date() },
  });

  res.status(200).json({
    status: 'success',
    data: {
      leave: updatedLeave,
    },
  });
});

// leave reports
exports.remainingLeaves = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  try {
    const employee = await prisma.employee.findUnique({
      where: {
        userId: id,
      },
    });
    const employeeId = employee.id;

    const leaveReports = await prisma.leave.groupBy({
      where: {
        employeeId: Number(employeeId),
        status: 'APPROVED',
      },
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

//Profile Management
exports.viewProfile = catchAsync(async (req, res, next) => {
  const { id } = req.user; // Extract userId from authenticated user info

  const employee = await prisma.employee.findUnique({
    where: { userId: id }, // Find employee by userId
  });

  if (!employee) {
    return next(new AppError('Employee profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employeeProfile: employee,
    },
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { id } = req.user; // Extract userId from authenticated user info

  const employee = await prisma.employee.findUnique({
    where: { userId: id }, // Find employee by userId
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const updatedEmployee = await prisma.employee.update({
    where: { id: employee.id },
    data: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      contact: req.body.contact,
      address: req.body.address,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      employee: updatedEmployee,
    },
  });
});
exports.updateProfilePicture = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const employee = await prisma.employee.findUnique({
    where: { userId: id },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  const imagePath = req.file.path;

  const updatedEmployee = await prisma.employee.update({
    where: { id: employee.id },
    data: {
      image: imagePath,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      employee: updatedEmployee,
    },
  });
});

//Task & Performance Management
exports.viewAssignedTasks = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const employee = await prisma.employee.findUnique({
    where: { userId: id },
    select: { id: true },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const tasks = await prisma.task.findMany({
    where: { employeeId: employee.id, status: 'PENDING' },
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      dueDate: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: { tasks },
  });
});

exports.submitTaskUpdate = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { taskId } = req.body;

  const employee = await prisma.employee.findUnique({
    where: { userId: id },
    select: { id: true },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task || task.employeeId !== employee.id) {
    return next(new AppError('Task not found or unauthorized', 404));
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  res.status(200).json({
    status: 'success',
    data: { updatedTask },
  });
});

exports.viewPerformanceReports = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { taskId } = req.params;

  const employee = await prisma.employee.findUnique({
    where: { userId: id },
    select: { id: true },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const performanceReport = await prisma.performance.findMany({
    where: {
      employeeId: employee.id,
      taskId: parseInt(taskId, 10),
    },
    include: {
      task: {
        select: {
          title: true,
          description: true,
          dueDate: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!performanceReport || performanceReport.length === 0) {
    return next(
      new AppError(`No performance report found for task ID ${taskId}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: { performanceReport },
  });
});

//Payroll & Compensation

exports.viewPayslip = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { month, year } = req.query;

  if (!month || !year) {
    return next(
      new AppError('Please provide both month and year in query params', 400)
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: id },
    select: { id: true },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const payslip = await prisma.payroll.findUnique({
    where: {
      employeeId_month_year: {
        employeeId: employee.id,
        month,
        year: parseInt(year, 10),
      },
    },
    include: {
      salaryStructure: true,
      PayrollTransaction: {
        orderBy: { transactionDate: 'desc' },
      },
    },
  });

  if (!payslip) {
    return next(new AppError(`No payslip found for ${month}/${year}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payslip,
    },
  });
});

// View Salary Details (e.g., salary structure) for an employee
exports.viewSalaryDetails = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { month, year } = req.query;

  if (!month || !year) {
    return next(
      new AppError('Please provide both month and year in query params', 400)
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: id },
    select: { id: true },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const salaryStructure = await prisma.salaryStructure.findUnique({
    where: {
      employeeId_month_year: {
        employeeId: employee.id,
        month,
        year: parseInt(year, 10),
      },
    },
  });

  if (!salaryStructure) {
    return next(
      new AppError(`No salary structure found for ${month}/${year}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      salaryStructure,
    },
  });
});

//Notifications & Announcements
exports.viewNotifications = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const employee = await prisma.employee.findUnique({
    where: { userId: id },
    select: { id: true },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientId: employee.id },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: { notifications },
  });
});

exports.viewSystemAnnouncements = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const employee = await prisma.employee.findUnique({
    where: { userId: id },
    select: {
      id: true,
      departmentId: true,
      user: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  let whereClause;

  if (employee.user.role === 'HR') {
    whereClause = { targetGroup: 'HR' };
  } else {
    whereClause = {
      OR: [
        { targetGroup: 'ALL_EMPLOYEES' },
        { departmentId: employee.departmentId },
      ],
    };
  }

  const announcements = await prisma.systemAnnouncement.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: announcements.length,
    data: { announcements },
  });
});

//holiday
exports.viewHolidayCalendar = catchAsync(async (req, res, next) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return next(new AppError('Please provide both month and year', 400));
  }

  const parsedYear = parseInt(year);

  const holidays = await prisma.holiday.findMany({
    where: {
      month: month,
      year: parsedYear,
    },
    orderBy: { date: 'asc' },
    select: {
      date: true,
      month: true,
      year: true,
      name: true,
    },
  });

  res.status(200).json({
    status: 'success',
    results: holidays.length,
    data: holidays,
  });
});
