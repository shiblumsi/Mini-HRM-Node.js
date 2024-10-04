const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { prisma } = require('../DB/db.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      hr: true,
      employee: true,
      role: true,
    },
  });

  if (!user) {
    return next(new AppError('No user found with this email!', 401));
  }
  const isPasswardValid = await bcrypt.compare(password, user.password);
  if (!isPasswardValid) {
    return next(new AppError('Password not matched!', 401));
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIREIN,
  });
  console.log(user.role.role);

  const userData = user.hr ? user.hr : user.employee;

  return res.status(200).json({
    status: 'ok',
    userRole: user.role.role,
    email: user.email,
    firstName:userData.firstName,
    token,
  });
});
