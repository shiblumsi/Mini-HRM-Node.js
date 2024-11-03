// salaryStructureRoutes.js
const express = require('express');
const salaryStructureController = require('../controllers/salaryStructureController');
const { adminAndHrOnly } = require('../middlewares/permissionMiddlewar');

const router = express.Router();

router.use(adminAndHrOnly);

router.get('/', salaryStructureController.getAllSalaryStructures);

router.post('/', salaryStructureController.createSalaryStructure);

router.put('/:id', salaryStructureController.updateSalaryStructure);

router.delete('/:id', salaryStructureController.deleteSalaryStructure);

module.exports = router;
