const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all leave types
exports.getAllLeaveTypes = catchAsync(async (req, res) => {
  const leaveTypes = await prisma.leaveType.findMany();
  res.json(leaveTypes);
});

// Create a new leave type
exports.createLeaveType = catchAsync(async (req, res, next) => {
  const { name, maxDays } = req.body;
  const leaveType = await prisma.leaveType.create({
    data: { name, maxDays },
  });
  res.status(201).json(leaveType);
});

// Get leave type by ID
exports.getLeaveTypeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const leaveType = await prisma.leaveType.findUnique({
    where: { id: Number(id) },
  });

  if (!leaveType) {
    return next(new AppError('Leave type not found', 404));
  }

  res.json(leaveType);
});
// Update an existing leave type
exports.updateLeaveType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, maxDays } = req.body;

  const leaveType = await prisma.leaveType.update({
    where: { id: Number(id) },
    data: { name, maxDays },
  });

  if (!leaveType) {
    return next(new AppError('Leave type not found', 404));
  }

  res.json(leaveType);
});

// Delete a leave type
exports.deleteLeaveType = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const leaveType = await prisma.leaveType.delete({
    where: { id: Number(id) },
  });

  if (!leaveType) {
    return next(new AppError('Leave type not found', 404));
  }

  res.status(204).send();
});
