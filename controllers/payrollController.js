const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { prisma } = require('../DB/db.config');

// Generate payroll
exports.generatePayroll = catchAsync(async (req, res, next) => {
  const { employeeId, month, year } = req.body;

  try {
    const salaryStructure = await prisma.salaryStructure.findFirst({
      where: {
        employeeId: Number(employeeId),
        month: Number(month),
        year: Number(year),
      },
    });

    if (!salaryStructure) {
      return next(
        new AppError(
          'Salary structure not found for this employee for the specified month and year.',
          404
        )
      );
    }

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        salaryStructureId: salaryStructure.id,
        month,
        year,
        totalPayable: salaryStructure.grossSalary,
      },
    });

    res.status(201).json({
      status: 'success',
      data: payroll,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(
        new AppError(
          'Payroll for this employee for the specified month and year already exists.',
          400
        )
      );
    }
    return next(new AppError('Error generating payroll', 500));
  }
});

// Retrieve payroll
exports.getPayroll = catchAsync(async (req, res, next) => {
  const { employeeId, month, year } = req.params;

  const payroll = await prisma.payroll.findUnique({
    where: {
      employeeId_month_year: {
        employeeId: Number(employeeId),
        month: Number(month),
        year: Number(year),
      },
    },
  });

  if (!payroll) {
    return next(
      new AppError(
        'Payroll not found for this employee in the specified month and year.',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    data: payroll,
  });
});

// Get payrolls for a specific month and year
exports.getPayrollsByMonthYear = catchAsync(async (req, res, next) => {
  const { month, year } = req.params;

  try {
    const payrolls = await prisma.payroll.findMany({
      where: {
        month: Number(month),
        year: Number(year),
      },
      include: {
        employee: true,
        salaryStructure: true,
      },
    });

    if (!payrolls || payrolls.length === 0) {
      return next(
        new AppError('No payrolls found for the specified month and year.', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: payrolls,
    });
  } catch (error) {
    return next(new AppError('Error fetching payroll records', 500));
  }
});

// Update payroll status
exports.updatePayrollStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedPayroll = await prisma.payroll.update({
    where: { id: Number(id) },
    data: { status },
  });

  res.status(200).json({
    status: 'success',
    data: updatedPayroll,
  });
});

// Delete payroll entry
exports.deletePayroll = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await prisma.payroll.delete({
    where: { id: Number(id) },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get salary slip for a specific employee for a specific month and year
exports.getSalarySlip = catchAsync(async (req, res, next) => {
  const { employeeId, month, year } = req.params;

  try {
    const salarySlip = await prisma.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: Number(employeeId),
          month: Number(month),
          year: Number(year),
        },
      },
      include: {
        employee: true,
        salaryStructure: true,
      },
    });

    if (!salarySlip) {
      return next(
        new AppError(
          'No salary slip found for the specified employee, month, and year.',
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: salarySlip,
    });
  } catch (error) {
    console.error('Error fetching salary slip:', error);
    return next(new AppError('Error fetching salary slip', 500));
  }
});
