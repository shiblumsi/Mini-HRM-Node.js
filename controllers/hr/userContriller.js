const { prisma } = require('../../DB/db.config');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createEmployee = catchAsync(async (req, res, next) => {
  const { email, password, departmentId, designationId } = req.body;

  // Check if the email is already taken
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    return next(new AppError('This email is already taken!', 400));
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create the new user
  const newUser = await prisma.user.create({
    data: {
      email,
      roleId: 2, // Assuming roleId 2 is for EMPLOYEE
      password: hashedPassword,
    },
  });

  // If user is created, create the Employee linked to the user
  let employee;
  if (newUser) {
    employee = await prisma.employee.create({
      data: {
        userId: newUser.id,
        departmentId: departmentId * 1,
        designationId: designationId * 1,
      },
    });
  }

  // Generate a JWT token
  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIREIN,
  });

  // Respond with success and the token
  return res.status(201).json({
    status: 'success',
    message: 'EMPLOYEE created successfully',
    token,
    data: employee,
  });
});
