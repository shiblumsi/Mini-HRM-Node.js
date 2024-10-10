const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { prisma } = require('../DB/db.config');










// Generate Attendance Report
exports.generateAttendanceReport = catchAsync(async (req, res, next) => {
  const { employeeId, month, year } = req.body;

  // Fetch attendance records for the employee in the given month/year
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      employeeId: employeeId * 1,
      month: month,
      year: year,
    },
  });

  const attendanceDays = attendanceRecords.filter(
    (record) => record.isPresent
  ).length;
  const absentDays = attendanceRecords.filter(
    (record) => !record.isPresent
  ).length;
  const lateDays = attendanceRecords.filter((record) => record.isLate).length;

  // Create the report
  const attendanceReport = await prisma.attendanceReport.create({
    data: {
      employeeId,
      attendanceDays,
      absentDays,
      lateDays,
      month,
      year,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      attendanceReport,
    },
  });
});


// Attendance Reports
exports.getAttendanceReports = catchAsync(async (req, res, next) => {
  const { employeeId, department, startDate, endDate } = req.query;

  // Build filters
  const filters = {};
  if (employeeId) filters.employeeId = Number(employeeId);
  if (department) filters.department = department;
  if (startDate && endDate) {
    filters.generatedAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const attendanceReports = await prisma.attendanceReport.findMany({
    where: filters,
  });

  res.status(200).json({
    status: 'success',
    data: {
      attendanceReports,
    },
  });
});

exports.getAttendanceReportByEmployeeId = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  const attendanceReport = await prisma.attendanceReport.findMany({
    where: { employeeId: Number(employeeId) },
  });

  if (!attendanceReport) {
    return next(
      new AppError('No attendance report found for this employee.', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      attendanceReport,
    },
  });
});


// Generate Payroll Report
exports.generatePayrollReport = catchAsync(async (req, res, next) => {
  const { employeeId, month, year } = req.body;
  console.log(req.body);
  

  const payrollData = await prisma.payroll.findUnique({
    where: {
      employeeId_month_year: {
        employeeId: employeeId*1,
        month: month,
        year: year,
      },
    },
  });

  const totalPayable = payrollData ? payrollData.totalPayable : 0;

  const payrollReport = await prisma.payrollReport.create({
    data: {
      employeeId,
      totalPayable,
      month,
      year,
      status: payrollData ? payrollData.status : 'PENDING',
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      payrollReport,
    },
  });
});



// Payroll Reports
exports.getPayrollReports = catchAsync(async (req, res, next) => {
  const { employeeId, department, startDate, endDate } = req.query;

  // Build filters
  const filters = {};
  if (employeeId) filters.employeeId = Number(employeeId);
  if (department) filters.department = department;
  if (startDate && endDate) {
    filters.generatedAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const payrollReports = await prisma.payrollReport.findMany({
    where: filters,
  });

  res.status(200).json({
    status: 'success',
    data: {
      payrollReports,
    },
  });
});

exports.getPayrollReportByEmployeeId = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  const payrollReport = await prisma.payrollReport.findMany({
    where: { employeeId: Number(employeeId) },
  });

  if (!payrollReport) {
    return next(
      new AppError('No payroll report found for this employee.', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      payrollReport,
    },
  });
});

// Leave Reports


// Generate Leave Report
exports.generateLeaveReport = catchAsync(async (req, res, next) => {
  const { employeeId, month, year } = req.body;

  // Fetch leave data for the given employee, month, and year
  const leaveData = await prisma.leave.findMany({
    where: {
      employeeId: employeeId*1,
     
    },
  });

  // Calculate total leave days using a traditional loop
  let totalLeaveDays = 0;
  let leaveTypeId = null;
  let leaveStatus = 'PENDING';

  for (let i = 0; i < leaveData.length; i++) {
    totalLeaveDays += leaveData[i].totalDays;
    leaveTypeId = leaveData[i].leaveTypeId; // Assuming all leaves are of the same type
    leaveStatus = leaveData[i].status;
  }

  // Create the leave report
  const leaveReport = await prisma.leaveReport.create({
    data: {
      employeeId,
      totalLeaveDays,
      leaveTypeId,
      status: leaveStatus,
      month,
      year,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      leaveReport,
    },
  });
});

exports.getLeaveReports = catchAsync(async (req, res, next) => {
  const { employeeId, department, startDate, endDate, status } = req.query;

  // Build filters
  const filters = {};
  if (employeeId) filters.employeeId = Number(employeeId);
  if (department) filters.department = department;
  if (status) filters.status = status;
  if (startDate && endDate) {
    filters.generatedAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const leaveReports = await prisma.leaveReport.findMany({
    where: filters,
  });

  res.status(200).json({
    status: 'success',
    data: {
      leaveReports,
    },
  });
});

exports.getLeaveReportByEmployeeId = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  const leaveReport = await prisma.leaveReport.findMany({
    where: { employeeId: Number(employeeId) },
  });

  if (!leaveReport) {
    return next(new AppError('No leave report found for this employee.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      leaveReport,
    },
  });
});



/// Generate Performance Report
exports.generatePerformanceReport = catchAsync(async (req, res, next) => {
  const { employeeId, month, year } = req.body;

  // Fetch performances associated with the employee and tasks completed in the specified month and year
  const performances = await prisma.performance.findMany({
    where: {
      employeeId: employeeId,
      task: {
        completedAt: { // Assuming you have a completedAt field in Task to track when tasks are completed
          gte: new Date(`${year}-${month}-01`),
          lte: new Date(`${year}-${month}-31`)
        },
      },
    },
    include: {
      task: true // Include task details if needed
    }
  });

  // Variables to store total tasks, ratings, and comments
  const totalTasks = performances.length;
  let totalRating = 0;
  let reviewCount = 0;
  let comments = [];

  // Iterate over performances to accumulate ratings and comments
  performances.forEach(performance => {
    if (performance.rating) {
      totalRating += performance.rating;
      reviewCount += 1;
    }
    if (performance.comments) {
      comments.push(performance.comments);
    }
  });

  // Calculate average rating
  const averageRating = reviewCount > 0 ? totalRating / reviewCount : null;

  // Create or update the performance report based on the aggregated data
  const performanceReport = await prisma.performanceReport.create({
    data: {
      employeeId,
      rating: averageRating,
      taskCompleted: totalTasks,
      feedback: comments.join('; '), // Concatenate comments
      month,
      year,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      performanceReport,
    },
  });
});



exports.getPerformanceReports = catchAsync(async (req, res, next) => {
  const { employeeId, department, startDate, endDate } = req.query;

  // Build filters
  const filters = {};
  if (employeeId) filters.employeeId = Number(employeeId);
  if (department) filters.department = department;
  if (startDate && endDate) {
    filters.generatedAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const performanceReports = await prisma.performanceReport.findMany({
    where: filters,
  });

  res.status(200).json({
    status: 'success',
    data: {
      performanceReports,
    },
  });
});

exports.getPerformanceReportByEmployeeId = catchAsync(
  async (req, res, next) => {
    const { employeeId } = req.params;

    const performanceReport = await prisma.performanceReport.findMany({
      where: { employeeId: Number(employeeId) },
    });

    if (!performanceReport) {
      return next(
        new AppError('No performance report found for this employee.', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        performanceReport,
      },
    });
  }
);

// Dashboard Overview
exports.getDashboardOverview = catchAsync(async (req, res, next) => {
  const employeeCount = await prisma.employee.count();
  const leaveStatus = await prisma.leaveReport.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });
  const payrollSummary = await prisma.payrollReport.aggregate({
    _sum: {
      totalPayable: true,
    },
  });

  const dashboardMetrics = {
    employeeCount,
    leaveStatus,
    payrollSummary: payrollSummary._sum.totalPayable || 0,
  };

  res.status(200).json({
    status: 'success',
    data: {
      dashboardMetrics,
    },
  });
});

// Custom Report
// exports.createCustomReport = catchAsync(async (req, res, next) => {
//   const { employeeId, department, startDate, endDate } = req.body;

//   const filters = {
//     employeeId,
//     department,
//     startDate,
//     endDate,
//   };

//   const reportData = {}; // Collect your custom report data based on filters here

//   const report = await prisma.report.create({
//     data: {
//       reportType: ReportType.CUSTOM, // You might need to add CUSTOM to your enum
//       generatedBy: req.user.id, // Assuming req.user contains the HR id
//       filters: JSON.stringify(filters),
//       result: JSON.stringify(reportData),
//     },
//   });

//   res.status(201).json({
//     status: 'success',
//     data: {
//       report,
//     },
//   });
// });
