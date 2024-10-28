// salaryStructureRoutes.js
const express = require('express');
const salaryStructureController = require('../controllers/salaryStructureController');

const router = express.Router();

router.get('/', salaryStructureController.getAllSalaryStructures);

router.post('/', salaryStructureController.createSalaryStructure);

router.put('/:id', salaryStructureController.updateSalaryStructure);

router.delete('/:id', salaryStructureController.deleteSalaryStructure);

module.exports = router;
