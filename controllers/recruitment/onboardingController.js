const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { prisma } = require('../../DB/db.config');

// Create an onboarding record
exports.createOnboarding = catchAsync(async (req, res, next) => {
  const { departmentId, jobApplicationId, designationId } = req.body;

  // Validate required fields
  if (!departmentId || !jobApplicationId || !designationId) {
    return next(new AppError('Department ID, Job Application ID, and Designation ID are required', 400));
  }

  const newOnboarding = await prisma.onboarding.create({
    data: {
      jobApplicationId: Number(jobApplicationId),
      departmentId: Number(departmentId),
      designationId: Number(designationId),
    },
  });

  res.status(201).json({
    status: 'success',
    data: { onboarding: newOnboarding },
  });
});

// Get all onboarding records
exports.getAllOnboardings = catchAsync(async (req, res, next) => {
  const onboardings = await prisma.onboarding.findMany({
    include: {
      department: true,
      jobApplication: true,
      designation: true,
    },
  });

  if (!onboardings.length) {
    return next(new AppError('No onboarding records found.', 404));
  }

  res.status(200).json({
    status: 'success',
    results: onboardings.length,
    data: { onboardings },
  });
});

// Get a specific onboarding record by ID
exports.getOnboardingById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const onboarding = await prisma.onboarding.findUnique({
    where: { id: Number(id) },
    include: {
      department: true,
      jobApplication: true,
      designation: true,
    },
  });

  if (!onboarding) {
    return next(new AppError('No onboarding record found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { onboarding },
  });
});

// Update an onboarding record
exports.updateOnboarding = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { designationId, status, completionDate } = req.body;

  const onboarding = await prisma.onboarding.findUnique({
    where: { id: Number(id) },
  });

  if (!onboarding) {
    return next(new AppError('No onboarding record found with that ID', 404));
  }

  const updatedOnboarding = await prisma.onboarding.update({
    where: { id: Number(id) },
    data: {
      designationId: designationId ? Number(designationId) : undefined,
      status: status || onboarding.status,
      completionDate: completionDate ? new Date(completionDate) : undefined,
    },
  });

  res.status(200).json({
    status: 'success',
    data: { onboarding: updatedOnboarding },
  });
});

// Delete an onboarding record
exports.deleteOnboarding = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const onboarding = await prisma.onboarding.findUnique({
    where: { id: Number(id) },
  });

  if (!onboarding) {
    return next(new AppError('No onboarding record found with that ID', 404));
  }

  await prisma.onboarding.delete({
    where: { id: Number(id) },
  });

  res.status(204).json({
    status: 'success',
    message: 'Onboarding record deleted successfully',
  });
});
