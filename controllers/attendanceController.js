const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const moment = require('moment');

// // Get Attendance by ID
exports.getAttendanceById = catchAsync(async (req, res, next) => {
  const { attId } = req.params;

  console.log('Attendance ID:', attId);

  try {
      const attendance = await prisma.attendance.findUnique({
          where: { id: Number(attId) },
      });

      if (!attendance) {
          return next(new AppError('No attendance record found with that ID.', 404));
      }

      // Format and respond with the attendance record
      const formattedAttendance = {
          ...attendance,
          checkIn: attendance.checkIn ? moment(attendance.checkIn).format('hh:mm A') : null,
          checkOut: attendance.checkOut ? moment(attendance.checkOut).format('hh:mm A') : null,
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
  )}-${attendanceDay}`; // Create full date in YYYY-MM-DD format

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

    // Calculate work hours in decimal form, with a custom rounding
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
  }

  // check lateArrival is true or false
  let lateArrival = false;
  const officeStartTime = moment(`${fullDate} 10:00 AM`, 'YYYY-MM-DD hh:mm A');
  if (checkInTime.isAfter(officeStartTime)) {
    lateArrival = true;
  }

  // Check if attendance data already exists
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
  // Create the attendance record
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

  // Find the attendance record by ID
  const attendanceRecord = await prisma.attendance.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!attendanceRecord) {
    return next(new AppError('No attendance record found with that ID.', 404));
  }

  // Check if check-in exists in the record, and if not, respond with an error
  if (!attendanceRecord.checkIn) {
    return next(
      new AppError('Check-in time is required to update the record.', 400)
    );
  }

  const currentDate = moment();
  const fullDate = `${attendanceRecord.year}-${currentDate.format('MM')}-${
    attendanceRecord.attendanceDate
  }`; // Create full date

  // Parse check-out time only if provided
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
    // Calculate work hours in decimal form, with a custom rounding
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

    // Update the attendance record
    const updatedRecord = await prisma.attendance.update({
      where: { id: Number(id) },
      data: {
        checkOut: checkOutTime.toDate(),
        overtime: overtime,
        workHoure: workHours,
        updatedAt: new Date(),
      },
    });

    // Respond with the updated attendance record
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

  // Initialize filters object
  const filters = {};

  // Filter by employee ID if provided
  if (employeeId) {
    filters.employeeId = Number(employeeId); // Convert to number
  }

  // Auto-generate month and year if not provided
  const currentDate = moment();
  const attendanceMonth = month || currentDate.format('MMM'); // Use current month if not provided
  const attendanceYear = year || currentDate.year(); // Use current year if not provided

  filters.month = attendanceMonth;
  filters.year = Number(attendanceYear); // Convert to number for the year filter

  // Filter by attendance date if provided
  if (attendanceDate) {
    filters.attendanceDate = attendanceDate; // Filter by specific attendance date
  }

  // Handle date range filtering for `checkIn` field (startDate and endDate)
  if (startDate || endDate) {
    filters.checkIn = {}; // Initialize the `checkIn` field for filtering

    if (startDate) {
      filters.checkIn.gte = new Date(startDate); // Greater than or equal to startDate
    }

    if (endDate) {
      filters.checkIn.lte = new Date(endDate); // Less than or equal to endDate
    }
  }

  // Retrieve attendance records with the applied filters
  const attendanceRecords = await prisma.attendance.findMany({
    where: filters,
    orderBy: {
      checkIn: 'desc', // Sort by check-in date in descending order
    },
  });

  // Return the response with formatted attendance records
  res.status(200).json({
    status: 'success',
    results: attendanceRecords.length,
    data: attendanceRecords.map((record) => ({
      ...record,
      checkIn: moment(record.checkIn).format('hh:mm A'), // Format checkIn time
      checkOut: record.checkOut
        ? moment(record.checkOut).format('hh:mm A')
        : null, // Format checkOut time
    })),
  });
});

// Generate monthly attendance report for an employee
exports.generateMonthlyAttendanceReport = catchAsync(async (req, res, next) => {
  const { employeeId, month, year } = req.body;

  // Fetch attendance records for the specified employee for the given month and year
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

  // Initialize report data
  let totalWorkingDays = attendanceRecords.length;
  let daysPresent = 0;
  let daysAbsent = 0;
  let leaveDays = 0; // This assumes you have a way to track leave days separately
  let lateArrivals = 0;
  let earlyDepartures = 0;
  let totalWorkHours = 0;
  let totalOvertime = 0;

  // Process attendance records
  attendanceRecords.forEach((record) => {
    if (record.checkOut) {
      daysPresent++;
      totalWorkHours += record.workHoure || 0; // Accumulate work hours
      totalOvertime += record.overtime || 0; // Accumulate overtime hours

      // Check if the employee arrived late or left early
      if (record.lateArrival) {
        lateArrivals++;
      }
      // Assuming a predefined early departure time
      const officeEndTime = moment('06:00 PM', 'hh:mm A'); // Change this based on your office policy
      const checkOutTime = moment(record.checkOut);

      if (checkOutTime.isBefore(officeEndTime)) {
        earlyDepartures++;
      }
    } else {
      daysAbsent++;
    }
  });

  // Calculate averages
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

  // Create the report in the database
  const attReport = await prisma.monthlyAttendanceReport.create({
    data: reportData,
  });

  // Respond with the generated report
  res.status(200).json({
    status: 'success',
    data: {
      report: attReport, // Return the created report
    },
  });
});

exports.overtimeAndLateAraivals = catchAsync(async (req, res, next) => {
  const { employeeId, month, year, startDate, endDate } = req.query;

  // Initialize filters
  const filters = {};
  if (employeeId) {
    filters.employeeId = Number(employeeId); // Convert to number
  }

  // Handle month and year filtering
  if (month) {
    filters.month = month; // Filter by month
  }

  if (year) {
    filters.year = Number(year); // Convert to number
  }

  // Handle date range filtering based on checkIn
  if (startDate || endDate) {
    const dateFilters = {};
    if (startDate) {
      dateFilters.checkIn = {
        gte: new Date(startDate), // Greater than or equal to startDate
      };
    }

    if (endDate) {
      dateFilters.checkIn = {
        ...dateFilters.checkIn,
        lte: new Date(endDate), // Less than or equal to endDate
      };
    }

    // Combine date filters with existing filters
    filters.checkIn = {
      ...dateFilters.checkIn,
    };
  }

  // Retrieve attendance records based on the filters
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

  // Initialize counters
  let totalOvertime = 0;
  let lateArrivals = 0;

  // Process attendance records
  attendanceRecords.forEach((record) => {
    if (record.overtime) {
      totalOvertime += record.overtime; // Sum up overtime hours
    }
    if (record.lateArrival) {
      lateArrivals++; // Count late arrivals
    }
  });

  // Respond with the overtime and late arrivals data
  res.status(200).json({
    status: 'success',
    data: {
      totalOvertime: parseFloat(totalOvertime).toFixed(2),
      lateArrivals,
      //attendanceRecords, // Optionally return the raw records
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
  const { employeeId, month, year } = req.query; // Employee ID, month, and year as query parameters

  if (!employeeId) {
    return next(new AppError('Employee ID is required.', 400));
  }

  // Find the employee by ID
  const employee = await prisma.employee.findUnique({
    where: { id: Number(employeeId) },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const attendanceYear = year ? Number(year) : moment().year(); // Default to current year if not provided
  const attendanceMonth = month ? month : moment().format('MMM'); // Default to current month if not provided

  // Fetch attendance records for the employee for the specified month and year
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      employeeId: Number(employeeId),
      month: attendanceMonth,
      year: attendanceYear,
    },
  });

  if (!attendanceRecords.length) {
    return next(new AppError('No attendance records found for the specified month and year.', 404));
  }

  // Calculate total work hours, overtime, and late arrivals
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

  // Respond with the attendance summary
  res.status(200).json({
    status: 'success',
    data: {
      employeeId,
      month: attendanceMonth,
      year: attendanceYear,
      totalDays,
      totalWorkHours: parseFloat(totalWorkHours.toFixed(2)), // Round to 2 decimal places
      totalOvertime: parseFloat(totalOvertime.toFixed(2)),
      lateArrivals,
    },
  });
});
