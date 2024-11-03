// routes/companySettingsRoutes.js
const express = require('express');
const router = express.Router();
const companySettingsController = require('../../controllers/settingsAndCustomization/companySettingsController');
const {adminOnly} = require("../../middlewares/permissionMiddlewar")


router.use(adminOnly)
// Route for getting and updating company settings
router.get('/company', companySettingsController.getCompanySettings);
router.put('/company', companySettingsController.updateCompanySettings);

module.exports = router;
