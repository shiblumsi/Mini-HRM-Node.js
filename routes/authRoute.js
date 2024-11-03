const express = require('express');
const authController = require('../controllers/authController');

const { isAuthenticated } = require('../middlewares/permissionMiddlewar');

const router = express.Router();

router.post('/login', authController.login);

router.use(isAuthenticated);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/update-password', authController.updatePassword);

module.exports = router;
