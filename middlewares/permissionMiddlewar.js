const { prisma } = require('../DB/db.config');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

// Middleware to verify if the user is authenticated
const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return next(new AppError('Authentication required', 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Error verifying token:', error);
    return next(new AppError('Invalid or expired token', 401));
  }

  let user;
  if (decoded.userType === 'ADMIN') {
    user = await prisma.admin.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });
  } else {
    user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });
  }

  if (!user) return next(new AppError('User not found', 401));

  req.user = user;
  next();
});

exports.isAuthenticated = isAuthenticated;

// Middleware to allow only Admins
exports.adminOnly = [
  isAuthenticated,
  (req, res, next) => {
    if (req.user.role?.role === 'ADMIN') {
      return next();
    }
    return next(new AppError('Admin access only', 403));
  },
];

// Middleware to allow only Employees
exports.employeeOnly = [
  isAuthenticated,
  (req, res, next) => {
    if (req.user.role?.role === 'EMPLOYEE') {
      return next();
    }
    return next(new AppError('Employee access only', 403));
  },
];

// Middleware to allow Admins and HRs
exports.adminAndHrOnly = [
  isAuthenticated,
  (req, res, next) => {
    if (['ADMIN', 'HR'].includes(req.user.role?.role)) {
      return next();
    }
    return next(new AppError('Access restricted to Admin or HR roles', 403));
  },
];
