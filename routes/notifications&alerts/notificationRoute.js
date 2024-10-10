// notifications.js
const express = require('express');
const notificationsController = require('../../controllers/notifications&alerts/notificationController');

const router = express.Router();

router.post('/',notificationsController.createSystemAnnouncement)

module.exports = router;
