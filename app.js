const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/globalErrorHandler');

//swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, 'docs/api.yaml'));
//routes
const departmentRoute = require('./routes/departmentRoute');
const designationRoute = require('./routes/designationRoute');
const userProfileRoute = require('./routes/userProfileRoute');
const attendanceRoute = require('./routes/attendanceRoute');
const employeeRoute = require('./routes/employeeRoute');
const leaveTypeRoute = require('./routes/leaveTypeRoute');
const basicSalaryRoute = require('./routes/basicSalaryRoute');
const payrollRoute = require('./routes/payrollRoute');
const salaryStructureRoutes = require('./routes/salaryStructureRoutes');
const payrollTransactionRoute = require('./routes/payrollTransactionRoute');
const taskRoute = require('./routes/task&performance/taskRoute');
const performanceRoute = require('./routes/task&performance/performanceRoute');
const leaveRoute = require('./routes/leaveRoute');
const authRoute = require('./routes/authRoute');
const roleRoute = require('./routes/admin/roleRoute');
const userRoute = require('./routes/admin/userRoute');

//*Recruitment Management*
const jobsRoute = require('./routes/recruitment/jobsRoute');
const applicationRoute = require('./routes/recruitment/applicationRoute');
const interviewRoute = require('./routes/recruitment/interviewRoute');
const onboardingRoute = require('./routes/recruitment/onboardingRoute');

const reportRoute = require('./routes/reportRoute');
const notificationRoute = require('./routes/notifications&alerts/notificationRoute');

// settings & customization
const companySettingsRoute = require('./routes/settingsAndCustomization/companySettingsRoute');
const holidayRoute = require('./routes/settingsAndCustomization/holidayRoute');

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

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Routes
app.use('/api/department', departmentRoute);
app.use('/api/designation', designationRoute);
app.use('/api/role', roleRoute);
app.use('/api/user/', userRoute);
app.use('/api/auth/', authRoute);
app.use('/api/user/profile', userProfileRoute);
app.use('/api/employee', employeeRoute);
app.use('/api/attendance', attendanceRoute);
app.use('/api/leave-types', leaveTypeRoute);
app.use('/api/leave', leaveRoute);
app.use('/api/salary', basicSalaryRoute);
app.use('/api/salary-structure', salaryStructureRoutes);
app.use('/api/payroll', payrollRoute);
app.use('/api/payroll-transactions', payrollTransactionRoute);
app.use('/api/task', taskRoute);
app.use('/api/performance', performanceRoute);
app.use('/api/job-openings', jobsRoute);
app.use('/api/application', applicationRoute);
app.use('/api/interview', interviewRoute);
app.use('/api/onboarding', onboardingRoute);
app.use('/api/report', reportRoute);
app.use('/api/notification', notificationRoute);
app.use('/api/settings', companySettingsRoute);
app.use('/api/holiday', holidayRoute);

//Path Not Found Middleware
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server...🥱`));
});
app.use(globalErrorHandler);
module.exports = app;
