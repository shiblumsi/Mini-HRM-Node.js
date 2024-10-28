const catchAsync = require('../utils/catchAsync');
const { prisma } = require('../DB/db.config');
const AppError = require('../utils/appError');

// Create a new designation
exports.createDesignation = catchAsync(async (req, res, next) => {
  const { title, departmentId } = req.body;
  const designation = await prisma.designation.create({
    data: {
      title,
      departmentId: Number(departmentId),
    },
  });

  if (!designation) {
    return next(new AppError('No designation created!', 400));
  }

  return res.status(201).json({
    status: 'success',
    data: designation,
  });
});

// Get all designations
exports.getAllDesignations = catchAsync(async (req, res, next) => {
  const designations = await prisma.designation.findMany();

  return res.status(200).json({
    status: 'success',
    results: designations.length,
    data: designations,
  });
});

// Get a single designation by ID
exports.getDesignationById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const designation = await prisma.designation.findUnique({
    where: { id: Number(id) },
  });

  if (!designation) {
    return next(new AppError('Designation not found!', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: designation,
  });
});

// Update a designation by ID
exports.updateDesignation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, departmentId } = req.body;

  const designation = await prisma.designation.update({
    where: { id: Number(id) },
    data: {
      title,
      departmentId: departmentId ? Number(departmentId) : undefined,
    },
  });

  if (!designation) {
    return next(new AppError('Designation not found or not updated!', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: designation,
  });
});

// Delete a designation by ID
exports.deleteDesignation = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const designation = await prisma.designation.delete({
    where: { id: Number(id) },
  });

  if (!designation) {
    return next(new AppError('Designation not found!', 404));
  }

  return res.status(204).json({
    status: 'success',
    data: null,
  });
});
