const express = require('express');
const departmentController = require('../controllers/departmentController');
const {adminOnly} = require("../middlewares/permissionMiddlewar")
const router = express.Router();


router.use(adminOnly)
router.post('/', departmentController.createDepartment);
router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;
