let express = require('express')
// const { getS, addS, getStudentByEnrollment, updateS, deleteS } = require('../controllers/studentController')
const { getProfile, profileUpdate, getAllTeacher, searchTeachers, deleteTeacher } = require('../controllers/teacherController')
// const { createSubject, getSubjects, updateSubject, deleteSubject, getMySubjects } = require('../controllers/subjectController')
const subjectRoute = require("../routes/subjectRoute")
const teacherRoute = require("../routes/teacherRoute")
let router = express.Router()

router.use("/subject", subjectRoute)
router.use("/teacher", teacherRoute)


module.exports = router 