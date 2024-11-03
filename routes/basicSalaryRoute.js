const express = require('express');
const router = express.Router();
const basicSalaryController = require('../controllers/basicSalaryController');

const { adminAndHrOnly } = require('../middlewares/permissionMiddlewar');

router.use(adminAndHrOnly);
router.post('/', basicSalaryController.createBasicSalary);
router.get('/', basicSalaryController.getAllBasicSalaries);
router.get('/:id', basicSalaryController.getBasicSalaryById);
router.put('/:id', basicSalaryController.updateBasicSalary);
router.delete('/:id', basicSalaryController.deleteBasicSalary);

module.exports = router;
