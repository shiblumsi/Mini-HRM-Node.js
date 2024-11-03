const express = require('express');
const payrollController = require('../controllers/payrollController');
const { adminAndHrOnly } = require('../middlewares/permissionMiddlewar');

const router = express.Router();

router.use(adminAndHrOnly);

router.post('/generate', payrollController.generatePayroll);
router.get('/employee/:employeeId/:month/:year', payrollController.getPayroll);
router.get('/:month/:year', payrollController.getPayrollsByMonthYear);
router.put('/:id', payrollController.updatePayrollStatus);
router.delete('/:id', payrollController.deletePayroll);

router.get(
  '/salary-slips/:employeeId/:month/:year',
  payrollController.getSalarySlip
);

module.exports = router;
