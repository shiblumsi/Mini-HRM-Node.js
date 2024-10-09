const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.allEmployees = catchAsync(async (req, res, next) => {
  // Fetch all employees from the database
  const allEmployees = await prisma.employee.findMany();

  // Check if employees were found
  if (!allEmployees.length) {
    return next(new AppError('No employees found', 404));
  }

  // Return the list of employees in the response
  res.status(200).json({
    status: 'success',
    results: allEmployees.length,
    data: {
      employees: allEmployees,
    },
  });
});

exports.getEmployeeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log('hfgjsdf',typeof(id));
  

  const employee = await prisma.employee.findUnique({
    where: { id: Number(id) },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employee,
    },
  });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedData = req.body;

  const employee = await prisma.employee.update({
    where: { id: Number(id) },
    data: updatedData,
  });

  if (!employee) {
    return next(new AppError('Failed to update employee', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employee,
    },
  });
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const employee = await prisma.employee.delete({
    where: { id: Number(id) },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Upload document for employee
exports.uploadEmployeeDocument = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log('sgfsfgdgdsgsdgdgg', req.body, req.file);

  const { title, documentType } = req.body;

  const employee = await prisma.employee.findUnique({
    where: { id: Number(id) },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const filePath = req.file.path;
  console.log('ytygdytdyt', filePath);

  const document = await prisma.document.create({
    data: {
      title: title || req.file.originalname,
      documentType: documentType || 'OTHER',
      filePath: filePath,
      employee: { connect: { id: Number(id) } },
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      document,
    },
  });
});

exports.getEmployeeDocuments = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const employee = await prisma.employee.findUnique({
    where: { id: Number(id) },
  });

  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const documents = await prisma.document.findMany({
    where: { employeeId: Number(id) },
    select: {
      title: true,
      documentType: true,
      filePath: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      documents,
    },
  });
});
