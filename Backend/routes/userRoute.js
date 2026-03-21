let express = require('express')
const { register, login } = require('../controllers/userController')
const verifyOTP = require('../middleware/verifyMail');
const sendOTP = require('../middleware/sendOTP');
let router  = express.Router()

// const checkRole = require('../middleware/checkRole')

// userRoute.post('/create-course', verifyToken, checkRole("teacher"), handler)
router.post('/sendotp', sendOTP);
router.post('/register', verifyOTP, register)
router.post('/login', login)

module.exports = router