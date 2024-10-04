const catchAsync = require('../utils/catchAsync');
const { prisma } = require('../DB/db.config');
const AppError = require('../utils/appError');

exports.createDesignation = catchAsync(async (req, res, next) => {
  const { title, departmentId } = req.body;
  const des = await prisma.designation.create({
    data: {
      title,
      departmentId: departmentId * 1,
    },
  });
  if (!des) {
    return next(new AppError('No designation Created!', 400));
  }
  return res.status(201).json({
    status: 'success',
    data: des,
  });
});
