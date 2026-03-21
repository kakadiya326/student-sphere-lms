let express = require('express')
const { getS, addS, getStudentByEnrollment, updateS, deleteS } = require('../controllers/studentController')
const { getProfile, profileUpdate, getAllTeacher, searchTeachers, deleteTeacher } = require('../controllers/teacherController')
const { createSubject, getSubjects, updateSubject, deleteSubject, getMySubjects } = require('../controllers/subjectController')
const { createClass, getClasses, getClassByTeacher, updateClass, deleteClass } = require('../controllers/classController')
let router  = express.Router()

//Student routes
router.post('/student', addS)
router.get('/students', getS)
router.get('/student/:enrollment', getStudentByEnrollment)
router.put('/student/:enrollment', updateS)
router.delete('/student/:enrollment', deleteS)

//Teacher routes
router.get('/teacher', getProfile)
router.get('/teachers', getAllTeacher)
router.put('/teacher', profileUpdate)
router.post('/teacher', searchTeachers)
router.delete('/teacher', deleteTeacher)

//Subject routes
router.post('/subject', createSubject)
router.get('/subjects', getSubjects)
router.put('/subject/:id', updateSubject)
router.delete('/subject/:id', deleteSubject)
router.get('/subject', getMySubjects)

//Class routes
router.post('/class', createClass)
router.get('/classes', getClasses)
router.get('/class', getClassByTeacher)
router.put('/class', updateClass)
router.delete('/class', deleteClass)


module.exports = router 