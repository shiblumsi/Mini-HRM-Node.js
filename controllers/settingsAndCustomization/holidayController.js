// controllers/holidayController.js
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { prisma } = require('../../DB/db.config');

// Get all holidays with optional filters for month and year
exports.getHolidays = catchAsync(async (req, res, next) => {
  const { month, year } = req.query;

  const holidays = await prisma.holiday.findMany({
    where: {
      ...(month && { month: Number(month) }),
      ...(year && { year: Number(year) }),
    },
  });

  res.status(200).json({
    status: 'success',
    results: holidays.length,
    data: holidays,
  });
});


// Create new holiday
exports.createHoliday = catchAsync(async (req, res, next) => {
  const { name, date, month, year } = req.body;

  try {
    const holiday = await prisma.holiday.create({
      data: { name, date, month, year },
    });
    res.status(201).json({
      status: 'success',
      message: 'Holiday created successfully',
      data: holiday,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(
        new AppError('A holiday already exists for this date.', 400)
      );
    }
    return next(new AppError('Error creating holiday', 500));
  }
});

// Update holiday
exports.updateHoliday = catchAsync(async (req, res, next) => {
  const { holidayId } = req.params;
  const { name, date, month, year } = req.body;

  try {
    const updatedHoliday = await prisma.holiday.update({
      where: { id: Number(holidayId) },
      data: { name, date, month, year },
    });
    res.status(200).json({
      status: 'success',
      message: 'Holiday updated successfully',
      data: updatedHoliday,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(
        new AppError('A holiday already exists for this date.', 400)
      );
    }
    return next(new AppError('Error updating holiday', 500));
  }
});

// Delete holiday
exports.deleteHoliday = catchAsync(async (req, res, next) => {
  const { holidayId } = req.params;

  await prisma.holiday.delete({
    where: { id: Number(holidayId) },
  });

  res.status(200).json({
    status: 'success',
    message: 'Holiday deleted successfully',
  });
});
