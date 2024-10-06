const express = require('express');
const employeeController = require('../controllers/employeeController');
const upload = require('../utils/multer');
const router = express.Router();

router.get('/', employeeController.allEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.patch('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.post('/:id/upload-document', upload.single('file'), employeeController.uploadEmployeeDocument);
router.get('/:id/document', employeeController.getEmployeeDocuments);

module.exports = router;
