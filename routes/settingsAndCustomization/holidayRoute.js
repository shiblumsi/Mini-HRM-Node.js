// routes/holidayRoutes.js
const express = require('express');
const router = express.Router();
const holidayController = require('../../controllers/settingsAndCustomization/holidayController');
const {adminAndHrOnly} = require("../../middlewares/permissionMiddlewar")


router.use(adminAndHrOnly)
// Routes for managing holidays
router.get('/', holidayController.getHolidays);
router.post('/', holidayController.createHoliday);
router.put('/:holidayId', holidayController.updateHoliday);
router.delete('/:holidayId', holidayController.deleteHoliday);

module.exports = router;
