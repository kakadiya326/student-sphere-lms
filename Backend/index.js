let express = require('express')
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const studentRoute = require('./routes/studentRoute')
const teacherRoute = require('./routes/teacherRoute')
const lessonRoute = require('./routes/lessonRoute')
const checkRole = require('./middleware/checkRole')
const verifyToken = require('./middleware/auth')

let route = express.Router()

route.use('/api/auth', userRoute)
route.use('/api/admin', verifyToken, checkRole('teacher'), adminRoute)
route.use('/api/student', verifyToken, checkRole('student'), studentRoute)
route.use('/api/teacher', verifyToken, checkRole('teacher'), teacherRoute)
route.use('/api/lessons', verifyToken, lessonRoute)

module.exports = route