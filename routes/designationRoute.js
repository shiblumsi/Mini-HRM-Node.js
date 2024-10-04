const express =require('express')
const desController = require('../controllers/designationController')

const router = express.Router()

router.post('/', desController.createDesignation)

module.exports = router;