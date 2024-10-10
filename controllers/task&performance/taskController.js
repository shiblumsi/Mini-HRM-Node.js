const { prisma } = require('../../DB/db.config');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const {sendEmail} =require('../../utils/sendMail')

// Assign a new task to an employee with email notification
exports.createTask = catchAsync(async (req, res, next) => {
  const { title, description, employeeId, priority, dueDate } = req.body;

  // Create the task
  const task = await prisma.task.create({
    data: {
      title,
      description,
      employeeId: Number(employeeId),
      priority,
      dueDate: new Date(dueDate),
    },
  });

  // Fetch the employee's related user (to get the email)
  const employee = await prisma.employee.findUnique({
    where: { id: Number(employeeId) },
    include: { 
      user: { select: { email: true } }  // Include the user's email
    },
  });

  // Ensure the employee's user email exists
  const email = employee?.user?.email;
  
  if (!email) {
    return next(new AppError('Employee email not found', 400));
  }

  // Send the email notification
  await sendEmail({
    to: email,  // Employee's user email
    subject: 'New Task Assigned',
    message: `You have been assigned a new task: "${title}".\n\nDescription: ${description}\nPriority: ${priority}\nDue Date: ${new Date(dueDate).toLocaleDateString()}`,
  });

  // Store the notification in the database
  await prisma.notification.create({
    data: {
      type: 'EMAIL',
      recipientId: employeeId,
      message: `You have been assigned a new task: "${title}".`,
      status: 'PENDING', // or 'SENT' based on your logic
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Task created and notification sent successfully',
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
  