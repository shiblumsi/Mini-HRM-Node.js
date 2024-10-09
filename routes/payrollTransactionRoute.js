const express = require('express');
const payrollTransactionController = require('../controllers/payrollTransactionController'); // Update with the correct path
const router = express.Router();

// Route to get all payroll transactions or by payrollId
router.get('/', payrollTransactionController.getPayrollTransactions);

// Route to create a new payroll transaction
router.post('/', payrollTransactionController.createPayrollTransaction);

// Route to update an existing payroll transaction
router.put('/:id', payrollTransactionController.updatePayrollTransaction);

// Route to delete a payroll transaction
router.delete('/:id', payrollTransactionController.deletePayrollTransaction);

module.exports = router;
