const express = require('express');
const leaveTypeController = require('../controllers/leaveTypesController');
const router = express.Router();
const {adminOnly} = require("../middlewares/permissionMiddlewar")

// Leave Type Routes
router.use(adminOnly)
router
  .route('/')
  .get(leaveTypeController.getAllLeaveTypes)
  .post(leaveTypeController.createLeaveType);

router
  .route('/:id')
  .get(leaveTypeController.getLeaveTypeById)
  .put(leaveTypeController.updateLeaveType)
  .delete(leaveTypeController.deleteLeaveType);

module.exports = router;
