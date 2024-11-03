// notifications.js
const express = require('express');
const notificationsController = require('../../controllers/notifications&alerts/notificationController');

const { adminAndHrOnly } = require('../../middlewares/permissionMiddlewar');

const router = express.Router();

router.use(adminAndHrOnly);

router.post('/',notificationsController.createSystemAnnouncement)

module.exports = router;
