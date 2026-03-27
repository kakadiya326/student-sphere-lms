const express = require("express")
const {
    createLesson,
    getLessonsBySubject,
    getLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    addAssignmentToLesson,
    updateAssignment,
    submitAssignment,
    getStudentSubmissions,
    getSubmissionsForLesson,
    gradeSubmission,
    markLessonComplete
} = require("../control/lessonCon")

const router = express.Router()

// Lesson CRUD
router.post("/", createLesson)
router.get("/subject/:subjectId", getLessonsBySubject)
router.get("/:id", getLesson)
router.put("/:id", updateLesson)
router.delete("/:id", deleteLesson)
router.put("/reorder", reorderLessons)

// Assignment management (Teacher only)
router.post("/:lessonId/assignments", addAssignmentToLesson)
router.put("/:lessonId/assignments/:assignmentIndex", updateAssignment)

// Student submissions
router.post("/submit", submitAssignment)
router.get("/:lessonId/submissions/student", getStudentSubmissions)
router.get("/:lessonId/submissions", getSubmissionsForLesson)
router.put("/submissions/:submissionId/grade", gradeSubmission)
router.post("/complete", markLessonComplete)

module.exports = router