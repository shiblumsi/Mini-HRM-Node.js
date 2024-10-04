const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

const globalErrorHandler = require('./middlewares/globalErrorHandler');

const departmentRoute = require('./routes/departmentRoute');
const designationRoute = require('./routes/designationRoute');
const userProfileRoute = require('./routes/userProfileRoute');
const authRoute = require('./routes/authRoute');
const roleRoute = require('./routes/admin/roleRoute');
const userRoute = require('./routes/admin/userRoute');
const AppError = require('./utils/appError');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Hi there 🙋‍♀️',
  });
});

//Routes
app.use('/api/department', departmentRoute);
app.use('/api/designation', designationRoute);
app.use('/api/role', roleRoute);
app.use('/api/user/', userRoute);
app.use('/api/auth/', authRoute);
app.use('/api/user/profile', userProfileRoute);


//Path Not Found Middleware
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server...🥱`));
});
app.use(globalErrorHandler);
module.exports = app;
