const { prisma } = require('../../DB/db.config');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// Assign a new task to an employee
exports.createTask = catchAsync(async (req, res, next) => {
  const { title, description, employeeId, priority, dueDate } = req.body;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      employeeId: Number(employeeId),
      priority,
      dueDate: new Date(dueDate),
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      task,
    },
  });
});

// Retrieve all tasks
exports.getAllTasks = catchAsync(async (req, res, next) => {
  const tasks = await prisma.task.findMany();

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

exports.getTaskById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Ensure that `id` is converted to a number
  const task = await prisma.task.findUnique({
    where: { id: id * 1 }, // Convert id to number
  });

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

// Update a specific task
exports.updateTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, priority, status, dueDate } = req.body;

  const task = await prisma.task.update({
    where: { id: Number(id) },
    data: {
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

// Delete a specific task
exports.deleteTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await prisma.task.delete({
    where: { id: Number(id) },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Mark a specific task as completed
exports.completeTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const task = await prisma.task.update({
    where: { id: Number(id) },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

exports.getTaskCompletionStatus = catchAsync(async (req, res, next) => {
    const { employeeId } = req.query; // Use query instead of body
  
    const tasks = await prisma.task.findMany({
      where: {
        employeeId: employeeId ? Number(employeeId) : undefined,
      },
      select: {
        id: true,
        status: true,
      },
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        tasks,
      },
    });
  });
  