const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { prisma } = require('../../DB/db.config');

// Create a new job opening
exports.createJobOpening = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    requirements,
    departmentId,
    location,
    employmentType,
    salaryRange,
    applicationDeadline,
  } = req.body;

  // Check if the required fields are provided
  if (!title || !departmentId || !employmentType) {
    return next(
      new AppError(
        'Title, Department, and Employment Type are required fields.',
        400
      )
    );
  }

  const newJob = await prisma.jobPosition.create({
    data: {
      title,
      description,
      requirements,
      departmentId: Number(departmentId),
      location,
      employmentType,
      salaryRange,
      applicationDeadline: new Date(applicationDeadline),
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      job: newJob,
    },
  });
});

// Get all job openings
exports.getAllJobOpenings = catchAsync(async (req, res, next) => {
  const jobs = await prisma.jobPosition.findMany({
    include: {
      department: true,
    },
  });

  if (!jobs.length) {
    return next(new AppError('No job openings found.', 404));
  }

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: {
      jobs,
    },
  });
});

// Get a job opening by ID
exports.getJobOpeningById = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await prisma.jobPosition.findUnique({
    where: { id: Number(jobId) },
    include: {
      department: true,
    },
  });

  if (!job) {
    return next(new AppError('No job found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      job,
    },
  });
});

// Update a job opening
exports.updateJobOpening = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;
  const { title, description, requirements, location, salaryRange, status } = req.body;

  const job = await prisma.jobPosition.findUnique({
    where: { id: Number(jobId) },
  });

  if (!job) {
    return next(new AppError('No job found with that ID', 404));
  }

  const updatedJob = await prisma.jobPosition.update({
    where: { id: Number(jobId) },
    data: {
      title,
      description,
      requirements,
      location,
      salaryRange,
      status
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      job: updatedJob,
    },
  });
});

// Delete a job opening
exports.deleteJobOpening = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await prisma.jobPosition.findUnique({
    where: { id: Number(jobId) },
  });

  if (!job) {
    return next(new AppError('No job found with that ID', 404));
  }

  await prisma.jobPosition.delete({
    where: { id: Number(jobId) },
  });

  res.status(204).json({
    status: 'success',
    message: 'Job opening deleted successfully',
  });
});
