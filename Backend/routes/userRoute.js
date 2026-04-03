let express = require('express')
const { register, login, uploadProfilePic } = require('../controllers/userController')
const verifyOTP = require('../middleware/verifyMail');
const sendOTP = require('../middleware/sendOTP');
const verifyToken = require('../middleware/auth')
let router  = express.Router()

// const checkRole = require('../middleware/checkRole')

// userRoute.post('/create-course', verifyToken, checkRole("teacher"), handler)

let multer = require('multer')
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './profilePics')
    },
    filename: function (req, file, cb) {
        const userId = req.user?.id || Date.now().toString()
        const userName = (req.user?.name || 'user').replace(/\s+/g, '_')
        const ext = file.mimetype.split('/')[1] || 'jpg'
        const uniqueSuffix = `${userId}-${userName}`
        cb(null, `${uniqueSuffix}.${ext}`)
    }
})
let upload = multer({ storage: storage })

router.post('/sendotp', sendOTP);
router.post('/verifyotp', verifyOTP, (req, res) => res.json({ "success": "OTP verified successfully" }));
router.post('/register', register)
router.post('/login', login)
router.post('/upload-profile-pic', verifyToken, upload.single('profilePic'), uploadProfilePic)

module.exports = router