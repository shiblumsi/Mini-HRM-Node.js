const catchAsync = require('../utils/catchAsync');
const { prisma } = require('../DB/db.config');
const AppError = require('../utils/appError');

// Create Department
exports.createDepartment = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  const dep = await prisma.department.create({
    data: {
      name,
      description,
    },
  });

  if (!dep) {
    return next(new AppError('No department created!', 400));
  }

  return res.status(201).json({
    status: 'success',
    data: dep,
  });
});

// Get All Departments
exports.getDepartments = catchAsync(async (req, res, next) => {
  const departments = await prisma.department.findMany();

  return res.status(200).json({
    status: 'success',
    results: departments.length,
    data: departments,
  });
});

// Get Department by ID
exports.getDepartment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const department = await prisma.department.findUnique({
    where: { id: parseInt(id) },
  });

  if (!department) {
    return next(new AppError(`Department not found with ID ${id}`, 404));
  }

  return res.status(200).json({
    status: 'success',
    data: department,
  });
});

// Update Department
exports.updateDepartment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const department = await prisma.department.update({
    where: { id: parseInt(id) },
    data: {
      name,
      description,
    },
  });

  if (!department) {
    return next(new AppError(`Department not updated for ID ${id}`, 400));
  }

  return res.status(200).json({
    status: 'success',
    data: department,
  });
});

// Delete Department
exports.deleteDepartment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const department = await prisma.department.delete({
    where: { id: parseInt(id) },
  });

  if (!department) {
    return next(new AppError(`Department not found with ID ${id}`, 404));
  }

  return res.status(204).json({
    status: 'success',
    data: null,
  });
});
