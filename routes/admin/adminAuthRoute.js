const express = require('express')
const adminAuth = require('../../controllers/admin/adminAuthController')


const router = express.Router()


router.post('/signup',adminAuth.adminSignup)
router.post('/login',adminAuth.adminLogin)


module.exports = router 