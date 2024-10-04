const express = require('express');
const userController = require('../../controllers/admin/userController');

const router = express.Router();

router.post('/create/hr', userController.createHr); // admin only
router.post('/create/employee', userController.createEmployee); // admin || hr only

module.exports = router;
