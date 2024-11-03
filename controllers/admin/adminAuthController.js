// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { prisma } = require('../../DB/db.config');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.adminSignup = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (existingAdmin) {
    return next(new AppError('Email is already in use', 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      roleId: 3,
    },
  });

  // Generate JWT for the new admin
  const token = jwt.sign(
    { id: admin.id, userType: 'ADMIN' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIREIN,
    }
  );

  // Send response
  res.status(201).json({
    status: 'success',
    token,
    data: {
      adminId: admin.id,
      email: admin.email,
    },
  });
});

exports.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!admin || admin.role.role !== 'ADMIN') {
    return next(new AppError('Invalid credentials or not an admin', 401));
  }

  const isPasswordCorrect = await bcrypt.compare(password, admin.password);
  if (!isPasswordCorrect) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = jwt.sign(
    { id: admin.id, userType: 'ADMIN' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIREIN,
    }
  );


  res.status(200).json({
    status: 'success',
    token,
    data: { adminId: admin.id, email: admin.email, role: admin.role.role },
  });
});
