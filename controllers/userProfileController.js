const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { firstName, lastName, contact, dob, hireDate, address, ...rest } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { hr: true, employee: true },
  });

  if (!user) {
    return next(new AppError('User not found!', 404));
  }

  const updateData = {
    firstName,
    lastName,
    contact,
    dob: dob ? new Date(dob) : undefined,
    hireDate: hireDate ? new Date(hireDate) : undefined,
    address,
    ...rest,
  };

  if (req.file) {
    // Store the image URL/path
    updateData.image = req.file.path;
  }

  let updatedData;
  if (user.hr) {
    updatedData = await prisma.hr.update({
      where: { userId: userId },
      data: updateData,
    });
  } else if (user.employee) {
    updatedData = await prisma.employee.update({
      where: { userId: userId },
      data: updateData,
    });
  } else {
    return next(new AppError('No profile found to update!', 400));
  }

  res.status(200).json({
    status: 'success',
    data: updatedData,
  });
});
