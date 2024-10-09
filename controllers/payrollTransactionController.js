const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { prisma } = require('../DB/db.config');

// Get all payroll transactions
exports.getPayrollTransactions = catchAsync(async (req, res, next) => {
  const { payrollId } = req.query;

  try {
    const transactions = await prisma.payrollTransaction.findMany({
      where: {
        ...(payrollId && { payrollId: Number(payrollId) }),
      },
    });

    res.status(200).json({
      status: 'success',
      data: transactions,
    });
  } catch (error) {
    return next(new AppError('Error retrieving payroll transactions', 500));
  }
});

// Create a new payroll transaction
exports.createPayrollTransaction = catchAsync(async (req, res, next) => {
  const { payrollId, paymentMethod, transactionStatus } = req.body;

  try {
    // Automatically generate the transaction date as the current date
    const transactionDate = new Date();

    // Fetch the associated payroll to get the amount
    const payroll = await prisma.payroll.findUnique({
      where: {
        id: Number(payrollId),
      },
    });

    // Check if the payroll exists
    if (!payroll) {
      return next(new AppError('Payroll record not found.', 404));
    }

    // Create the payroll transaction
    const transaction = await prisma.payrollTransaction.create({
      data: {
        payrollId: Number(payrollId),
        transactionDate: transactionDate, // Use the current date
        amount: payroll.totalPayable, // Use the total payable amount from the payroll
        paymentMethod,
        transactionStatus,
      },
    });

    res.status(201).json({
      status: 'success',
      data: transaction,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(new AppError('Payroll transaction already exists.', 400));
    }
    return next(new AppError('Error creating payroll transaction', 500));
  }
});

// Update an existing payroll transaction
exports.updatePayrollTransaction = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { paymentMethod, transactionStatus } = req.body;

  try {
    const transaction = await prisma.payrollTransaction.update({
      where: { id: Number(id) },
      data: {
        paymentMethod,
        transactionStatus
      },
    });

    res.status(200).json({
      status: 'success',
      data: transaction,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return next(new AppError('Payroll transaction not found.', 404));
    }
    return next(new AppError('Error updating payroll transaction', 500));
  }
});

// Delete a payroll transaction
exports.deletePayrollTransaction = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.payrollTransaction.delete({
      where: { id: Number(id) },
    });

    res.status(204).json({
      status: 'success',
      message: 'Payroll transaction deleted successfully.',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return next(new AppError('Payroll transaction not found.', 404));
    }
    return next(new AppError('Error deleting payroll transaction', 500));
  }
});
