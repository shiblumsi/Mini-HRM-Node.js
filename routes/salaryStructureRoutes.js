// salaryStructureRoutes.js
const express = require('express');
const salaryStructureController = require('../controllers/salaryStructureController');

const router = express.Router();

// Retrieve all salary structures
router.get('/', salaryStructureController.getAllSalaryStructures);

// Create a new salary structure
router.post('/', salaryStructureController.createSalaryStructure);

// Update an existing salary structure
router.put('/:id', salaryStructureController.updateSalaryStructure);

// Delete a salary structure
router.delete('/:id', salaryStructureController.deleteSalaryStructure);

module.exports = router;
