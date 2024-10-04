const express =require('express')
const {updateProfile} = require('../controllers/userProfileController')
const upload = require('../utils/multer')
const {protect} = require('../middlewares/authMiddleware')

const router = express.Router()

router.put('/update', protect,upload.single('image'), updateProfile)

module.exports = router;