const express = require('express');
const designationController = require('../controllers/designationController');

const router = express.Router();

router
  .route('/')
  .post(designationController.createDesignation)
  .get(designationController.getAllDesignations);

router
  .route('/:id')
  .get(designationController.getDesignationById)
  .put(designationController.updateDesignation)
  .delete(designationController.deleteDesignation);

module.exports = router;
