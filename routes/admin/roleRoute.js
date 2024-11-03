const express = require('express');
const roleController = require('../../controllers/admin/roleController');
const { adminOnly } = require('../../middlewares/permissionMiddlewar');

const router = express.Router();

router.post('/', adminOnly, roleController.createRole);

module.exports = router;
