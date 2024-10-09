// controllers/interviewController.js
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { prisma } = require('../../DB/db.config');

// Create a new interview
exports.createInterview = catchAsync(async (req, res, next) => {
  const { jobApplicationId, hrId, interviewDate, interviewTime } = req.body;

  // Check if the required fields are provided
  if (!jobApplicationId || !hrId || !interviewDate || !interviewTime) {
    return next(
      new AppError(
        'Job Application ID, HR ID, Interview Date, Time are required fields.',
        400
      )
    );
  }

  // Validate the time format (optional check)
  const timeFormat = /^(0?[1-9]|1[0-2]):[0-5][0-9] ?[APap][mM]$/;
  if (!timeFormat.test(interviewTime)) {
    return next(new AppError('Invalid time format. Use HH:MM AM/PM', 400));
  }

  const newInterview = await prisma.interview.create({
    data: {
      jobApplicationId: Number(jobApplicationId),
      hrId: Number(hrId),
      interviewDate: new Date(interviewDate),
      interviewTime,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      interview: newInterview,
    },
  });
});

// Get all interviews
exports.getAllInterviews = catchAsync(async (req, res, next) => {
  const interviews = await prisma.interview.findMany({
    include: {
      jobApplication: true,
      interviewer: true,
    },
  });

  if (!interviews.length) {
    return next(new AppError('No interviews found.', 404));
  }

  res.status(200).json({
    status: 'success',
    results: interviews.length,
    data: {
      interviews,
    },
  });
});

// Get an interview by ID
exports.getInterviewById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const interview = await prisma.interview.findUnique({
    where: { id: Number(id) },
    include: {
      jobApplication: true,
      interviewer: true,
    },
  });

  if (!interview) {
    return next(new AppError('No interview found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      interview,
    },
  });
});

// Update an interview
exports.updateInterview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { interviewDate, interviewTime, feedback, result, status } = req.body;

  const interview = await prisma.interview.findUnique({
    where: { id: Number(id) },
  });

  if (!interview) {
    return next(new AppError('No interview found with that ID', 404));
  }

  // Validate the time format (optional check)
  const timeFormat = /^(0?[1-9]|1[0-2]):[0-5][0-9] ?[APap][mM]$/;
  if (interviewTime && !timeFormat.test(interviewTime)) {
    return next(new AppError('Invalid time format. Use HH:MM AM/PM', 400));
  }

  const updatedInterview = await prisma.interview.update({
    where: { id: Number(id) },
    data: {
      interviewDate: new Date(interviewDate),
      interviewTime,
      feedback,
      result,
      status,
    },
  });

  res.status(200).json({
    status: 'updated',
    data: {
      interview: updatedInterview,
    },
  });
});

// Delete an interview
exports.deleteInterview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const interview = await prisma.interview.findUnique({
    where: { id: Number(id) },
  });

  if (!interview) {
    return next(new AppError('No interview found with that ID', 404));
  }

  await prisma.interview.delete({
    where: { id: Number(id) },
  });

  res.status(204).json({
    status: 'success',
    message: 'Interview deleted successfully',
  });
});

// Get interviews by Job Application ID
exports.getInterviewsByJobApplicationId = catchAsync(async (req, res, next) => {
  const { jobApplicationId } = req.params;

  const interviews = await prisma.interview.findMany({
    where: { jobApplicationId: Number(jobApplicationId) },
  });

  if (!interviews.length) {
    return next(
      new AppError('No interviews found for this job application.', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    results: interviews.length,
    data: {
      interviews,
    },
  });
});
