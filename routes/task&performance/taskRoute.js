const express = require('express');
const taskController = require('../../controllers/task&performance/taskController');
const { adminAndHrOnly } = require('../../middlewares/permissionMiddlewar');

const router = express.Router();

router.use(adminAndHrOnly);

router.post('/', taskController.createTask);
router.get('/get-all', taskController.getAllTasks);

router
  .route('/:id')
  .get(taskController.getTaskById)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

router.put('/:id/complete', taskController.completeTask);

router.get('/completion-status', taskController.getTaskCompletionStatus);

module.exports = router;
