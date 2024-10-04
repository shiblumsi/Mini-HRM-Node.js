const express =require('express')
const depController = require('../controllers/departmentController')

const router = express.Router()

router.post('/', depController.createDepartment)

module.exports = router;