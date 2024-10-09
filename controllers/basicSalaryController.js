const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new basic salary
exports.createBasicSalary = catchAsync(async (req, res, next) => {
    const { employeeId, amount } = req.body;

    // Check if a basic salary already exists for this employee
    const existingSalary = await prisma.basicSalary.findFirst({
        where: {
            employeeId: Number(employeeId),
        },
    });

    if (existingSalary) {
        return next(new AppError('Basic salary already exists for this employee', 400));
    }

    // Create the new basic salary record
    const newSalary = await prisma.basicSalary.create({
        data: {
            employeeId: Number(employeeId),
            amount,
            effectiveDate: new Date(),
        },
    });

    res.status(201).json({
        status: 'success',
        data: {
            salary: newSalary,
        },
    });
});

// Get all basic salaries
exports.getAllBasicSalaries = catchAsync(async (req, res, next) => {
    const salaries = await prisma.basicSalary.findMany({
        include: {
            employee: true, // Include employee details if needed
        },
    });

    res.status(200).json({
        status: 'success',
        data: {
            salaries,
        },
    });
});

// Get a basic salary by ID
exports.getBasicSalaryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const salary = await prisma.basicSalary.findUnique({
        where: { id: Number(id) },
        include: {
            employee: true, // Include employee details if needed
        },
    });

    if (!salary) {
        return next(new AppError('Basic salary not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            salary,
        },
    });
});

// Update an existing basic salary
exports.updateBasicSalary = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { amount } = req.body;

    const salary = await prisma.basicSalary.update({
        where: { id: Number(id) },
        data: {
            amount,
            effectiveDate: new Date(),
        },
    });

    if (!salary) {
        return next(new AppError('Basic salary not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            salary,
        },
    });
});

// Delete a basic salary
exports.deleteBasicSalary = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const salary = await prisma.basicSalary.delete({
        where: { id: Number(id) },
    });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
