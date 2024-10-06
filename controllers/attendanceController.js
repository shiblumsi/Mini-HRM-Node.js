const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const moment = require('moment');

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

  const currentMonth = moment().format('MMM');
  const monthValue = month || currentMonth;

  const currentYear = moment().year();
  const yearValue = year || currentYear;

  if (!moment(monthValue, 'MMM', true).isValid()) {
    return next(
      new AppError('Invalid month format. Use "MMM" (e.g., "May").', 400)
    );
  }

  const checkInTime = moment(checkIn, 'hh:mm A');
  if (!checkInTime.isValid()) {
    return next(
      new AppError(
        'Invalid check-in time format. Use "hh:mm A" (e.g., "10:01 AM").',
        400
      )
    );
  }

  const checkOutTime = checkOut ? moment(checkOut, 'hh:mm A') : null;
  if (checkOut && !checkOutTime.isValid()) {
    return next(
      new AppError(
        'Invalid check-out time format. Use "hh:mm A" (e.g., "06:01 PM").',
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

  // Generate attendanceDate if not provided
  const attendanceDateValue = attendanceDate || moment().date().toString(); // Use current date if not provided

  // check lateArrival is true or false
  let = lateArrival = false;
  const officeTime = moment('10:00 AM', 'hh:mm A');
  if (checkInTime.isAfter(officeTime)) {
    lateArrival = true;
  }

  // Check if attendance data already exists
  const isExistAttendanceData = await prisma.attendance.findUnique({
    where: {
      employeeId_month_year_attendanceDate: {
        employeeId: Number(employeeId),
        month: monthValue,
        year: yearValue,
        attendanceDate: attendanceDateValue,
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
      checkIn: checkInTime.format('hh:mm A'),
      checkOut: checkOut ? checkOutTime.format('hh:mm A') : null,
      overtime: overtime || 0,
      lateArrival: lateArrival || false,
      month: monthValue,
      year: yearValue,
      attendanceDate: attendanceDateValue,
      workHoure: workHours || 0,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      attendance,
    },
  });
});

exports.getAttendanceByDate = catchAsync(async (req, res, next) => {
  const { employeeId, attendanceDate, month, year, startDate, endDate } =
    req.query;
  console.log(req.query);

  // Initialize filters
  const filters = {};
  console.log(filters);
  

  if (employeeId) {
    filters.employeeId = Number(employeeId); // Convert to number
  }

  if (attendanceDate) {
    filters.attendanceDate = attendanceDate; // Filter by attendance date
  }

  if (month) {
    filters.month = month; // Filter by month
  }

  if (year) {
    filters.year = Number(year); // Convert to number
  }

  // Handle date range filtering
  if (startDate || endDate) {
    const dateFilters = {};
    console.log(startDate,endDate);
    

    if (startDate) {
      dateFilters.createdAt = {
        gte: new Date(startDate), // Greater than or equal to startDate
      };

      
    }

    if (endDate) {
      dateFilters.createdAt = {
        ...dateFilters.createdAt,
        lte: new Date(endDate), // Less than or equal to endDate
      };

      
    }

    // Combine date filters with existing filters
    filters.createdAt = {
      ...dateFilters.createdAt,
    };
    console.log(filters);
    
  }

  // Retrieve attendance logs with filters
  const attendanceLogs = await prisma.attendance.findMany({
    where: filters,
    orderBy: {
      createdAt: 'desc', // Optional: Order by createdAt in descending order
    },
  });

  // Respond with success and the attendance logs
  res.status(200).json({
    status: 'success',
    results: attendanceLogs.length,
    data: {
      attendanceLogs,
    },
  });
});

// Generate monthly attendance reports
exports.generateMonthlyReports = catchAsync(async (req, res, next) => {
  const { employeeId, month, year } = req.query;

  // Validate month and year
  if (month && !moment(month, 'MMM', true).isValid()) {
    return next(
      new AppError('Invalid month format. Use "MMM" (e.g., "May").', 400)
    );
  }

  // Build filters based on the provided query parameters
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

  // Retrieve attendance records based on filters
  const attendanceRecords = await prisma.attendance.findMany({
    where: filters,
  });

  // If no records found, send a message
  if (attendanceRecords.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'No attendance records found for the given filters.',
      data: attendanceRecords,
    });
  }

  // Respond with the attendance records
  res.status(200).json({
    status: 'success',
    data: attendanceRecords,
  });
});
