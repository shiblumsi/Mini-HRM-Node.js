const express = require('express');
const leaveTypeController = require('../controllers/leaveTypesController');
const router = express.Router();

// Leave Type Routes
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
