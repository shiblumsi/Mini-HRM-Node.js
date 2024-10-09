const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { prisma } = require('../../DB/db.config');

// Function to submit a job application
exports.submitJobApplication = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;
  const { applicantName, applicantEmail } = req.body;

  // Check if the job exists and retrieve its status and deadline
  const job = await prisma.jobPosition.findUnique({
    where: { id: Number(jobId) },
    select: {
      status: true,
      applicationDeadline: true,
    },
  });

  if (!job) {
    return next(new AppError('No job found with that ID', 404));
  }

  // Check if the job is open
  if (job.status !== 'OPEN') {
    return next(
      new AppError('This job is no longer accepting applications', 400)
    );
  }

  // Check if the application deadline has passed
  const currentDateTime = new Date();
  if (job.applicationDeadline && job.applicationDeadline < currentDateTime) {
    return next(new AppError('The application deadline has passed', 400));
  }

  // Create a new job application
  const newApplication = await prisma.jobApplication.create({
    data: {
      applicantName,
      applicantEmail,
      resume:
        req.files['resume'] && req.files['resume'][0]
          ? req.files['resume'][0].path
          : null, // Save the file path if a resume is uploaded
      coverLetter:
        req.files['coverLetter'] && req.files['coverLetter'][0]
          ? req.files['coverLetter'][0].path
          : null, // Save the file path if a cover letter is uploaded
      jobPositionId: Number(jobId),
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      application: newApplication,
    },
  });
});

// Function to get all applications for a specific job
exports.getApplicationsForJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  // Retrieve applications for the specific job
  const applications = await prisma.jobApplication.findMany({
    where: { jobPositionId: Number(jobId) },
    include: {
      jobPosition: true, // Include job position details if needed
    },
  });

  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: {
      applications,
    },
  });
});

// Function to get details of a specific application
exports.getApplicationById = catchAsync(async (req, res, next) => {
  const { applicationId } = req.params;

  const application = await prisma.jobApplication.findUnique({
    where: { id: Number(applicationId) },
    include: {
      jobPosition: true, // Include job position details if needed
    },
  });

  if (!application) {
    return next(new AppError('No application found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      application,
    },
  });
});

// Function to update a specific job application
exports.updateJobApplication = catchAsync(async (req, res, next) => {
  const { applicationId } = req.params;
  const { status } = req.body; 
  console.log(req.body);


  if (!status) {
    return next(new AppError('Please provide a valid status to update.', 400));
  }

  const updateData = { status };

  if (status === 'PENDING') {
    updateData.isShortlisted = false;
  } else {
    updateData.isShortlisted = true;
  }

  const updatedApplication = await prisma.jobApplication.update({
    where: { id: Number(applicationId) },
    data: updateData,
  });

  res.status(200).json({
    status: 'success',
    data: {
      application: updatedApplication,
    },
  });
});

// Function to delete a specific job application
exports.deleteJobApplication = catchAsync(async (req, res, next) => {
  const { applicationId } = req.params;

  await prisma.jobApplication.delete({
    where: { id: Number(applicationId) },
  });

  res.status(204).json({
    status: 'success',
    message: 'Job application deleted successfully',
  });
});
