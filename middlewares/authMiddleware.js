const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { prisma } = require('../DB/db.config');

// Protect middleware to check if user is logged in
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Check if token is in the authorization header and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      hr: true, // Optionally include HR data
      employee: true, // Optionally include Employee data
    },
  });

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  req.user = currentUser;

  // Proceed to the next middleware or route handler
  next();
});
