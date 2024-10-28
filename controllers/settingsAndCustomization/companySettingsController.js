// controllers/companySettingsController.js
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { prisma } = require('../../DB/db.config');

// Get Company Settings
exports.getCompanySettings = catchAsync(async (req, res, next) => {
  const settings = await prisma.companySettings.findUnique({where:{id:1}});
  if (!settings) return next(new AppError('Company settings not found', 404));

  res.status(200).json(settings);
});

// Update Company Settings
exports.updateCompanySettings = catchAsync(async (req, res, next) => {
  const {
    name,
    address,
    contactInfo,
    timezone,
    workingHoursStart,
    workingHoursEnd,
  } = req.body;
  const updatedSettings = await prisma.companySettings.update({
    where: { id: 1 },
    data: {
      name,
      address,
      contactInfo,
      timezone,
      workingHoursStart,
      workingHoursEnd,
    },
  });
  res.status(200).json({
    message: 'Company settings updated successfully',
    updatedSettings,
  });
});
