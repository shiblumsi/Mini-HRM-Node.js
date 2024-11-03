const express = require('express');
const payrollTransactionController = require('../controllers/payrollTransactionController'); // Update with the correct path
const { adminAndHrOnly } = require('../middlewares/permissionMiddlewar');

const router = express.Router();

router.use(adminAndHrOnly);

router.get('/', payrollTransactionController.getPayrollTransactions);

router.post('/', payrollTransactionController.createPayrollTransaction);

router.put('/:id', payrollTransactionController.updatePayrollTransaction);

router.delete('/:id', payrollTransactionController.deletePayrollTransaction);

module.exports = router;
