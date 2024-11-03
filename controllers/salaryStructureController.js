// salaryStructureController.js
const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { calculateGrossSalary } = require('../helperFunctions');

exports.getAllSalaryStructures = catchAsync(async (req, res, next) => {
  const salaryStructures = await prisma.salaryStructure.findMany();
  res.status(200).json({
    status: 'success',
    results: salaryStructures.length,
    data: salaryStructures,
  });
});

exports.createSalaryStructure = catchAsync(async (req, res, next) => {
  const {
    employeeId,
    houseAllowance,
    medicalAllowance,
    otherAllowance,
    overtimeRate,
    month,
    year,
  } = req.body;

  const basicSalary = await prisma.basicSalary.findUnique({
    where: {
      id: employeeId * 1,
    },
  });
  const attendanceReport = await prisma.monthlyAttendanceReport.findFirst({
    where: {
      month,
      employeeId: Number(employeeId),
      year: Number(year),
    },
  });
  const amountPerDay = basicSalary.amount / attendanceReport.totalWorkingDays;
  const absentDay = attendanceReport.daysAbsent - attendanceReport.leaveDays;
  let deductions = amountPerDay * absentDay;
  let isLate = attendanceReport.lateArrivals * 300;
  deductions = deductions + isLate;
  let overtimeHours = attendanceReport.overtimeHours;
  try {
    const grossSalary = await calculateGrossSalary(
      basicSalary.id,
      houseAllowance,
      medicalAllowance,
      otherAllowance,
      deductions,
      overtimeHours,
      overtimeRate
    );

    const newSalaryStructure = await prisma.salaryStructure.create({
      data: {
        employeeId,
        basicSalaryId:basicSalary.id,
        houseAllowance,
        medicalAllowance,
        otherAllowance,
        overtimeHours,
        overtimeRate,
        deductions,
        grossSalary,
        month,
        year,
      },
    });

    res.status(201).json({
      status: 'success',
      data: newSalaryStructure,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(
        new AppError(
          'Salary structure for this employee for the specified month and year already exists.',
          400
        )
      );
    }
    return next(new AppError('Error creating salary structure', 500));
  }
});

// Update an existing salary structure
exports.updateSalaryStructure = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    basicSalaryId,
    houseAllowance,
    medicalAllowance,
    otherAllowance,
    overtimeHours,
    overtimeRate,
    deductions,
    month,
    year,
  } = req.body;

  try {
    // Calculate the new gross salary before updating

    const grossSalary = await calculateGrossSalary(
      basicSalaryId,
      houseAllowance,
      medicalAllowance,
      otherAllowance,
      deductions,
      overtimeHours,
      overtimeRate
    );

    const updatedSalaryStructure = await prisma.salaryStructure.update({
      where: { id: Number(id) },
      data: {
        houseAllowance,
        medicalAllowance,
        otherAllowance,
        overtimeHours,
        overtimeRate,
        deductions,
        grossSalary, // Update the gross salary as well
        month,
        year,
      },
    });

    res.status(200).json({
      status: 'success',
      data: updatedSalaryStructure,
    });
  } catch (error) {
    console.error(error); // Log the error to see the actual issue
    return next(new AppError('Error updating salary structure', 500));
  }
});

// Delete a salary structure
exports.deleteSalaryStructure = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await prisma.salaryStructure.delete({
    where: { id: Number(id) },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
