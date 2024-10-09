const { prisma } = require('../../DB/db.config');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// Create a performance evaluation for an employee
exports.createPerformanceEvaluation = catchAsync(async (req, res, next) => {
  const { employeeId, taskId, review, rating, comments } = req.body;

  const task = await prisma.task.findUnique({
    where: {
      id: Number(taskId),
    },
  });

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (task.status !== 'COMPLETED') {
    return next(
      new AppError(
        'Performance evaluation can only be created for completed tasks',
        400
      )
    );
  }

  const performance = await prisma.performance.create({
    data: {
      employeeId: Number(employeeId),
      taskId: Number(taskId),
      review,
      rating,
      comments,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      performance,
    },
  });
});

exports.getAllPerformanceEvaluation = catchAsync(async (req, res, next) => {
  const evaluations = await prisma.performance.findMany({});

  res.status(200).json({
    status: 'success',
    results: evaluations.length,
    data: {
      evaluations,
    },
  });
});
// Retrieve performance evaluations for a specific employee
exports.getPerformanceEvaluationsByEmployee = catchAsync(
  async (req, res, next) => {
    const { employeeId } = req.params;

    const evaluations = await prisma.performance.findMany({
      where: { employeeId: Number(employeeId) },
    });

    res.status(200).json({
      status: 'success',
      results: evaluations.length,
      data: {
        evaluations,
      },
    });
  }
);

// Update a specific performance evaluation record
exports.updatePerformanceEvaluation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { review, rating, comments } = req.body;

  const evaluation = await prisma.performance.update({
    where: { id: Number(id) },
    data: {
      review,
      rating,
      comments,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      evaluation,
    },
  });
});

// Generate performance reports for all employees
exports.generatePerformanceReports = catchAsync(async (req, res, next) => {
  const reports = await prisma.performance.groupBy({
    by: ['employeeId'],
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      reports,
    },
  });
});

// Generate a performance report for a specific employee
exports.getPerformanceReportByEmployee = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  const report = await prisma.performance.aggregate({
    where: { employeeId: Number(employeeId) },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      report,
    },
  });
});
