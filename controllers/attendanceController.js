const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const moment = require('moment');

// // Get Attendance by ID
exports.getAttendanceById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log("hfsbkjfdk");
  

  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: Number(id) },
    });

    if (!attendance) {
      return next(
        new AppError('No attendance record found with that ID.', 404)
      );
    }

    const formattedAttendance = {
      ...attendance,
      checkIn: attendance.checkIn
        ? moment(attendance.checkIn).format('hh:mm A')
        : null,
      checkOut: attendance.checkOut
        ? moment(attendance.checkOut).format('hh:mm A')
        : null,
    };

    res.status(200).json({
      status: 'success',
      data: formattedAttendance,
    });
  } catch (error) {
    return next(new AppError('Database query failed.', 500));
  }
});

// Record daily attendance for an employee
exports.recordAttendance = catchAsync(async (req, res, next) => {
  const { employeeId, checkIn, checkOut, month, year, attendanceDate } =
    req.body;

  const employee = await prisma.employee.findUnique({
    where: { id: Number(employeeId) },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const currentDate = moment();
  const attendanceDay = attendanceDate || currentDate.format('DD');
  const attendanceMonth = month || currentDate.format('MMM');
  const attendanceYear = year || currentDate.year();

  const fullDate = `${attendanceYear}-${currentDate.format(
    'MM'
  )}-${attendanceDay}`;

  // Parse check-in time and check-out time
  const checkInTime = moment(`${fullDate} ${checkIn}`, 'YYYY-MM-DD hh:mm A');
  if (!checkInTime.isValid()) {
    return next(
      new AppError(
        'Invalid check-in time format. Use "hh:mm A" (e.g., "10:00 AM").',
        400
      )
    );
  }

  const checkOutTime = checkOut
    ? moment(`${fullDate} ${checkOut}`, 'YYYY-MM-DD hh:mm A')
    : null;
  if (checkOut && !checkOutTime.isValid()) {
    return next(
      new AppError(
        'Invalid check-out time format. Use "hh:mm A" (e.g., "06:00 PM").',
        400
      )
    );
  }

  if (checkOutTime && checkOutTime.isBefore(checkInTime)) {
    return next(
      new AppError('Check-out time cannot be before check-in time.', 400)
    );
  }

  // Calculate work hours if checkOut is provided
  let workHours = null;
  let overtime = 0;
  if (checkOutTime) {
    const totalMinutes = checkOutTime.diff(checkInTime, 'minutes');
    const fullHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (remainingMinutes === 0) {
      workHours = fullHours;
    } else if (remainingMinutes < 10) {
      workHours = parseFloat(`${fullHours}.0${remainingMinutes}`);
    } else {
      workHours = parseFloat(`${fullHours}.${remainingMinutes}`);
    }

    workHours = parseFloat(workHours.toFixed(2));

    if (workHours > 8) {
      overtime = parseFloat((workHours - 8).toFixed(2)); // Overtime hours
    }
  }

  let lateArrival = false;
  const officeStartTime = moment(`${fullDate} 10:00 AM`, 'YYYY-MM-DD hh:mm A');
  if (checkInTime.isAfter(officeStartTime)) {
    lateArrival = true;
  }

  const isExistAttendanceData = await prisma.attendance.findUnique({
    where: {
      employeeId_month_year_attendanceDate: {
        employeeId: Number(employeeId),
        month: attendanceMonth,
        year: attendanceYear,
        attendanceDate: attendanceDay,
      },
    },
  });

  if (isExistAttendanceData) {
    return next(
      new AppError(
        "Today's attendance for this employee is already recorded!",
        400
      )
    );
  }

  const attendance = await prisma.attendance.create({
    data: {
      employeeId: Number(employeeId),
      checkIn: checkInTime.toDate(),
      checkOut: checkOut ? checkOutTime.toDate() : null,
      overtime: overtime || 0,
      lateArrival: lateArrival || false,
      month: attendanceMonth,
      year: attendanceYear,
      attendanceDate: attendanceDay,
      workHoure: workHours || 0,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      ...attendance,
      checkIn: moment(attendance.checkIn).format('hh:mm A'),
      checkOut: attendance.checkOut
        ? moment(attendance.checkOut).format('hh:mm A')
        : null,
    },
  });
});

// Update Attendance Record
exports.updateCheckOut = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let { checkOut } = req.body;

  const attendanceRecord = await prisma.attendance.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!attendanceRecord) {
    return next(new AppError('No attendance record found with that ID.', 404));
  }

  if (!attendanceRecord.checkIn) {
    return next(
      new AppError('Check-in time is required to update the record.', 400)
    );
  }

  const currentDate = moment();
  const fullDate = `${attendanceRecord.year}-${currentDate.format('MM')}-${
    attendanceRecord.attendanceDate
  }`;

  let checkOutTime = null;
  if (checkOut) {
    checkOutTime = moment(`${fullDate} ${checkOut}`, 'YYYY-MM-DD hh:mm A');
    if (!checkOutTime.isValid()) {
      return next(
        new AppError(
          'Invalid check-out time format. Use "hh:mm A" (e.g., "06:00 PM").',
          400
        )
      );
    }

    // Check if checkOut time is before checkIn time
    const checkInTime = moment(attendanceRecord.checkIn);
    if (checkOutTime.isBefore(checkInTime)) {
      return next(
        new AppError('Check-out time cannot be before check-in time.', 400)
      );
    }

    // Calculate work hours and overtime
    const totalMinutes = checkOutTime.diff(checkInTime, 'minutes');
    const fullHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    let overtime = 0;
    let workHours = 0;

    if (remainingMinutes === 0) {
      workHours = fullHours;
    } else if (remainingMinutes < 10) {
      workHours = parseFloat(`${fullHours}.0${remainingMinutes}`);
    } else {
      workHours = parseFloat(`${fullHours}.${remainingMinutes}`);
    }

    workHours = parseFloat(workHours.toFixed(2));

    // Calculate overtime if work hours exceed 8
    if (workHours > 8) {
      overtime = parseFloat((workHours - 8).toFixed(2)); // Overtime hours
    }

    const updatedRecord = await prisma.attendance.update({
      where: { id: Number(id) },
      data: {
        checkOut: checkOutTime.toDate(),
        overtime: overtime,
        workHoure: workHours,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        ...updatedRecord,
        checkIn: moment(updatedRecord.checkIn).format('hh:mm A'),
        checkOut: updatedRecord.checkOut
          ? moment(updatedRecord.checkOut).format('hh:mm A')
          : null,
      },
    });
  } else {
    return next(
      new AppError(
        'Check-out time is required for updating overtime and work hours.',
        400
      )
    );
  }
});

// Get attendance records by filters (employeeId, attendanceDate, month, year, startDate, endDate)
exports.getAttendanceByDate = catchAsync(async (req, res, next) => {
  const { employeeId, attendanceDate, month, year, startDate, endDate } =
    req.query;

  const filters = {};

  if (employeeId) {
    filters.employeeId = Number(employeeId);
  }

  const currentDate = moment();
  const attendanceMonth = month || currentDate.format('MMM');
  const attendanceYear = year || currentDate.year();

  filters.month = attendanceMonth;
  filters.year = Number(attendanceYear);

  if (attendanceDate) {
    filters.attendanceDate = attendanceDate;
  }

  if (startDate || endDate) {
    filters.checkIn = {};

    if (startDate) {
      filters.checkIn.gte = new Date(startDate);
    }

    if (endDate) {
      filters.checkIn.lte = new Date(endDate);
    }
  }

  const attendanceRecords = await prisma.attendance.findMany({
    where: filters,
    orderBy: {
      checkIn: 'desc',
    },
  });

  res.status(200).json({
    status: 'success',
    results: attendanceRecords.length,
    data: attendanceRecords.map((record) => ({
      ...record,
      checkIn: moment(record.checkIn).format('hh:mm A'),
      checkOut: record.checkOut
        ? moment(record.checkOut).format('hh:mm A')
        : null,
    })),
  });
});

// Generate monthly attendance report for an employee
exports.generateMonthlyAttendanceReport = catchAsync(async (req, res, next) => {
  const { employeeId, month, year } = req.query;

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      employeeId: Number(employeeId),
      month: month,
      year: Number(year),
    },
  });

  if (!attendanceRecords.length) {
    return next(
      new AppError(
        'No attendance records found for the specified month and year.',
        404
      )
    );
  }

  const offDays = await prisma.holiday.findMany({
    where: {
      month,
      year: Number(year),
    },
  });

  // Initialize report data
  let totalWorkingDays = attendanceRecords.length - offDays.length;
  let daysPresent = 0;
  let daysAbsent = 0;
  let leaveDays = 0;
  let lateArrivals = 0;
  let earlyDepartures = 0;
  let totalWorkHours = 0;
  let totalOvertime = 0;

  attendanceRecords.forEach((record) => {
    if (record.checkOut) {
      daysPresent++;
      totalWorkHours += record.workHoure || 0;
      totalOvertime += record.overtime || 0;

      if (record.lateArrival) {
        lateArrivals++;
      }

      const officeEndTime = moment('06:00 PM', 'hh:mm A');
      const checkOutTime = moment(record.checkOut);

      if (checkOutTime.isBefore(officeEndTime)) {
        earlyDepartures++;
      }
    } else {
      daysAbsent++;
    }
  });
  daysAbsent = daysAbsent - offDays.length;

  // Fetch approved leaves for the employee in the specified month and year
  const approvedLeaves = await prisma.leave.findMany({
    where: {
      employeeId: Number(employeeId),
      status: 'APPROVED',
      startDate: {
        lte: new Date(`${year}-${month}-31`),
      },
      endDate: {
        gte: new Date(`${year}-${month}-01`),
      },
    },
  });

  // Calculate leave days within the month
  approvedLeaves.forEach((leave) => {
    // Calculate the start and end of the leave within the specified month
    const start = new Date(
      Math.max(
        new Date(`${year}-${month}-01`).getTime(),
        leave.startDate.getTime()
      )
    );
    const end = new Date(
      Math.min(
        new Date(`${year}-${month}-31`).getTime(),
        leave.endDate.getTime()
      )
    );

    // Calculate the number of days within the month
    leaveDays += Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  });

  const averageWorkHours =
    daysPresent > 0 ? (totalWorkHours / daysPresent).toFixed(2) : 0;

  // Prepare the report object
  const reportData = {
    employeeId: Number(employeeId),
    month: month,
    year: Number(year),
    totalWorkingDays,
    daysPresent,
    daysAbsent,
    leaveDays,
    lateArrivals,
    earlyDepartures,
    averageWorkHours: parseFloat(averageWorkHours),
    overtimeHours: totalOvertime,
  };

  const attReport = await prisma.monthlyAttendanceReport.create({
    data: reportData,
  });

  res.status(200).json({
    status: 'success',
    data: {
      report: attReport,
    },
  });
});

exports.overtimeAndLateAraivals = catchAsync(async (req, res, next) => {
  const { employeeId, month, year, startDate, endDate } = req.query;

  // Initialize filters
  const filters = {};
  if (employeeId) {
    filters.employeeId = Number(employeeId);
  }

  if (month) {
    filters.month = month;
  }

  if (year) {
    filters.year = Number(year);
  }

  if (startDate || endDate) {
    const dateFilters = {};
    if (startDate) {
      dateFilters.checkIn = {
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      dateFilters.checkIn = {
        ...dateFilters.checkIn,
        lte: new Date(endDate),
      };
    }

    filters.checkIn = {
      ...dateFilters.checkIn,
    };
  }

  const attendanceRecords = await prisma.attendance.findMany({
    where: filters,
  });

  if (!attendanceRecords.length) {
    return next(
      new AppError(
        'No attendance records found for the specified criteria.',
        404
      )
    );
  }

  let totalOvertime = 0;
  let lateArrivals = 0;

  attendanceRecords.forEach((record) => {
    if (record.overtime) {
      totalOvertime += record.overtime;
    }
    if (record.lateArrival) {
      lateArrivals++;
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalOvertime: parseFloat(totalOvertime).toFixed(2),
      lateArrivals,
    },
  });
});

// Delete Attendance Record
exports.deleteAttendance = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const attendanceRecord = await prisma.attendance.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!attendanceRecord) {
    return next(new AppError('No attendance record found with that ID.', 404));
  }

  await prisma.attendance.delete({
    where: {
      id: Number(id),
    },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get Employee Attendance Summary
exports.getEmployeeAttendanceSummary = catchAsync(async (req, res, next) => {
  console.log('hgjkhgjhghjfgjhfg');

  const { employeeId, month, year } = req.query;
  console.log(req.query);

  if (!employeeId) {
    return next(new AppError('Employee ID is required.', 400));
  }

  const employee = await prisma.employee.findUnique({
    where: { id: Number(employeeId) },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const attendanceYear = year ? Number(year) : moment().year();
  const attendanceMonth = month ? month : moment().format('MMM');

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      employeeId: Number(employeeId),
      month: attendanceMonth,
      year: attendanceYear,
    },
  });

  if (!attendanceRecords.length) {
    return next(
      new AppError(
        'No attendance records found for the specified month and year.',
        404
      )
    );
  }

  let totalWorkHours = 0;
  let totalOvertime = 0;
  let lateArrivals = 0;

  attendanceRecords.forEach((record) => {
    totalWorkHours += record.workHoure || 0;
    totalOvertime += record.overtime || 0;
    if (record.lateArrival) {
      lateArrivals += 1;
    }
  });

  const totalDays = attendanceRecords.length;

  res.status(200).json({
    status: 'success',
    data: {
      employeeId,
      month: attendanceMonth,
      year: attendanceYear,
      totalDays,
      totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
      totalOvertime: parseFloat(totalOvertime.toFixed(2)),
      lateArrivals,
    },
  });
});
