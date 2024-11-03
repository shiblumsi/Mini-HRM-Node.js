const express = require('express');
const userController = require('../../controllers/admin/userController');
const { adminAndHrOnly } = require('../../middlewares/permissionMiddlewar');

const router = express.Router();

router.use(adminAndHrOnly);
router.post('/create/hr', userController.createHr);
router.post('/create/employee', userController.createEmployee);

module.exports = router;
