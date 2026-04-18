const lessonModel = require("../models/lessonModel");
const subjectModel = require("../models/subjectModel");
const teacherModel = require("../models/teacherModel");
const submissionModel = require("../models/submissionModel");
const studentModel = require("../models/studentModel");

let createLesson = async (req, res) => {
    try {
        const userId = req.user.id
        console.log("BODY:", req.body)

        let {
            title,
            description,
            content,
            subjectId,
            order,
            duration,
            assignments,
            resources
        } = req.body

        // 🔥 FIX: Parse if string
        if (typeof assignments === 'string') {
            assignments = JSON.parse(assignments)
        }

        if (typeof resources === 'string') {
            resources = JSON.parse(resources)
        }

        assignments = assignments || []
        resources = resources || []

        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "warning": "Teacher profile not found" })
        }

        const subject = await subjectModel.findOne({
            _id: subjectId,
            teacherId: teacher._id
        })

        if (!subject) {
            return res.json({ "error": "Subject not found or not authorized" })
        }

        const lesson = new lessonModel({
            title,
            description,
            content,
            subjectId,
            order: order || 0,
            duration: duration || 0,
            assignments: assignments || [],
            resources: resources || []
        })

        await lesson.save()

        res.json({ "success": "Lesson created", lesson })

    } catch (error) {
        console.log(error)
        res.json({ "error": "Error creating lesson" })
    }
}

let getLessonsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params

        const subject = await subjectModel.findById(subjectId)
        if (!subject) {
            return res.json({ "error": "Subject not found" })
        }

        if (req.user.role === 'teacher') {
            const teacher = await teacherModel.findOne({ userId: req.user.id })
            if (!teacher || subject.teacherId.toString() !== teacher._id.toString()) {
                return res.json({ "error": "Not authorized to view lessons for this subject" })
            }
        }

        const lessons = await lessonModel.find({
            subjectId,
            isActive: true
        }).sort({ order: 1 })

        res.json({ lessons })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error fetching lessons" })
    }
}

let getLesson = async (req, res) => {
    try {
        const { id } = req.params

        const lesson = await lessonModel.findById(id).populate('subjectId', 'name code teacherId')
        if (!lesson) {
            return res.json({ "error": "Lesson not found" })
        }

        if (req.user.role === 'teacher') {
            const teacher = await teacherModel.findOne({ userId: req.user.id })
            if (!teacher || lesson.subjectId.teacherId.toString() !== teacher._id.toString()) {
                return res.json({ "error": "Not authorized to view this lesson" })
            }
        }

        res.json({ lesson })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error fetching lesson" })
    }
}

let updateLesson = async (req, res) => {
    try {
        const userId = req.user.id
        const { id } = req.params
        const updateData = req.body

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "error": "Teacher profile not found" })
        }

        // Find the lesson and verify ownership through subject
        const lesson = await lessonModel.findById(id).populate('subjectId')
        if (!lesson) {
            return res.json({ "error": "Lesson not found" })
        }

        if (lesson.subjectId.teacherId.toString() !== teacher._id.toString()) {
            return res.json({ "warning": "Not authorized to update this lesson" })
        }

        const updatedLesson = await lessonModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )

        res.json({ "success": "Lesson updated", lesson: updatedLesson })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error updating lesson" })
    }
}

let deleteLesson = async (req, res) => {
    try {
        const userId = req.user.id
        const { id } = req.params

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "warning": "Teacher profile not found" })
        }

        // Find the lesson and verify ownership through subject
        const lesson = await lessonModel.findById(id).populate('subjectId')
        if (!lesson) {
            return res.json({ "warning": "Lesson not found" })
        }

        if (lesson.subjectId.teacherId.toString() !== teacher._id.toString()) {
            return res.json({ "error": "Not authorized to delete this lesson" })
        }

        await lessonModel.findByIdAndDelete(id)

        res.json({ "success": "Lesson deleted" })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error deleting lesson" })
    }
}

let reorderLessons = async (req, res) => {
    try {
        const userId = req.user.id
        const { subjectId, lessonOrders } = req.body // lessonOrders: [{lessonId, order}]

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "warning": "Teacher profile not found" })
        }

        // Verify the subject belongs to this teacher
        const subject = await subjectModel.findOne({ _id: subjectId, teacherId: teacher._id })
        if (!subject) {
            return res.json({ "warning": "Subject not found or not authorized" })
        }

        // Update lesson orders
        for (const { lessonId, order } of lessonOrders) {
            await lessonModel.findByIdAndUpdate(lessonId, { order })
        }

        res.json({ "success": "Lessons reordered" })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error reordering lessons" })
    }
}

// Assignment-related functions
let addAssignmentToLesson = async (req, res) => {
    try {
        const userId = req.user.id
        const { lessonId } = req.params
        const assignmentData = req.body

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "error": "Teacher profile not found" })
        }

        // Find the lesson and verify ownership
        const lesson = await lessonModel.findById(lessonId).populate('subjectId')
        if (!lesson) {
            return res.json({ "error": "Lesson not found" })
        }

        if (lesson.subjectId.teacherId.toString() !== teacher._id.toString()) {
            return res.json({ "error": "Not authorized to modify this lesson" })
        }

        lesson.assignments.push(assignmentData)
        await lesson.save()

        res.json({ "success": "Assignment added", lesson })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error adding assignment" })
    }
}

let updateAssignment = async (req, res) => {
    try {
        const userId = req.user.id
        const { lessonId, assignmentIndex } = req.params
        const updateData = req.body

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "warning": "Teacher profile not found" })
        }

        // Find the lesson and verify ownership
        const lesson = await lessonModel.findById(lessonId).populate('subjectId')
        if (!lesson) {
            return res.json({ "warning": "Lesson not found" })
        }

        if (lesson.subjectId.teacherId.toString() !== teacher._id.toString()) {
            return res.json({ "warning": "Not authorized to modify this lesson" })
        }

        if (!lesson.assignments[assignmentIndex]) {
            return res.json({ "warning": "Assignment not found" })
        }

        lesson.assignments[assignmentIndex] = { ...lesson.assignments[assignmentIndex], ...updateData }
        await lesson.save()

        res.json({ "success": "Assignment updated", lesson })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error updating assignment" })
    }
}

// Student submission functions
let submitAssignment = async (req, res) => {
    try {
        const studentId = req.user.id
        const { lessonId, assignmentIndex, answers, textSubmission } = req.body

        const student = await studentModel.findById(studentId)
        if (!student) {
            return res.status(401).json({ "error": 'Student profile not found' })
        }

        const lesson = await lessonModel.findById(lessonId).populate('subjectId')
        if (!lesson) {
            return res.status(404).json({ "error": 'Lesson not found' })
        }

        if (!lesson.subjectId) {
            return res.status(400).json({ "error": 'Lesson subject not found' })
        }

        if (!student.courseIds.includes(lesson.subjectId._id)) {
            return res.status(403).json({ "error": 'Not enrolled in this subject' })
        }

        // Handle file uploads
        const submittedFiles = []
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                submittedFiles.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: `/uploads/${file.filename}`,
                    uploadedAt: new Date()
                })
            })
        }

        const submission = await submissionModel.findOneAndUpdate(
            { studentId, lessonId, assignmentIndex },
            {
                answers: answers ? JSON.parse(answers) : [],
                textSubmission: textSubmission || '',
                submittedFiles: submittedFiles.length > 0 ? submittedFiles : undefined,
                status: 'submitted',
                submittedAt: new Date(),
                maxPoints: lesson.assignments[assignmentIndex]?.maxPoints || 10
            },
            { upsert: true, new: true }
        )

        res.json({ "success": 'Assignment submitted', submission })
    } catch (error) {
        console.error(error)
        res.status(500).json({ "error": 'Error submitting assignment' })
    }
}

let getStudentSubmissions = async (req, res) => {
    try {
        const studentId = req.user.id
        const { lessonId } = req.params

        const submissions = await submissionModel.find({
            studentId,
            lessonId
        }).sort({ assignmentIndex: 1 })

        res.json({ submissions })
    } catch (error) {
        console.error(error)
        res.status(500).json({ "error": 'Error fetching submissions' })
    }
}

let getAllStudentSubmissions = async (req, res) => {
    try {
        const studentId = req.user.id

        const submissions = await submissionModel.find({ studentId })
            .populate({
                path: 'lessonId',
                select: 'title subjectId',
                populate: {
                    path: 'subjectId',
                    select: 'name code'
                }
            })
            .sort({ submittedAt: -1 })

        // Transform data for frontend
        const transformedSubmissions = submissions.map(sub => ({
            _id: sub._id,
            lessonId: sub.lessonId?._id,
            lessonTitle: sub.lessonId?.title || 'Unknown Lesson',
            subjectTitle: sub.lessonId?.subjectId?.name || 'Unknown Subject',
            assignmentIndex: sub.assignmentIndex,
            status: sub.status,
            score: sub.grade,
            maxPoints: sub.maxPoints,
            feedback: sub.feedback,
            submittedAt: sub.submittedAt,
            dueDate: sub.dueDate
        }))

        res.json({ submissions: transformedSubmissions })
    } catch (error) {
        console.error(error)
        res.status(500).json({ "error": 'Error fetching submissions' })
    }
}


let getSubmissionsForLesson = async (req, res) => {
    try {
        const userId = req.user.id
        const { lessonId } = req.params

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "error": "Teacher profile not found" })
        }

        // Verify lesson ownership
        const lesson = await lessonModel.findById(lessonId).populate('subjectId')
        if (!lesson || lesson.subjectId.teacherId.toString() !== teacher._id.toString()) {
            return res.json({ "error": "Lesson not found or not authorized" })
        }

        const submissions = await submissionModel.find({ lessonId })
            .populate('studentId', 'enrollment _id')
            .populate('studentId._id', 'name email')
            .sort({ submittedAt: -1 })

        res.json({ submissions })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error fetching submissions" })
    }
}

let gradeSubmission = async (req, res) => {
    try {
        const userId = req.user.id
        const { submissionId } = req.params
        const { grade, score, feedback } = req.body

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.status(401).json({ "error": 'Teacher profile not found' })
        }

        const submission = await submissionModel.findById(submissionId).populate({
            path: 'lessonId',
            populate: { path: 'subjectId' }
        })

        if (!submission) {
            return res.status(404).json({ "error": 'Submission not found' })
        }

        if (!submission.lessonId || !submission.lessonId.subjectId) {
            return res.status(400).json({ "error": 'Invalid submission references' })
        }

        if (submission.lessonId.subjectId.teacherId.toString() !== teacher._id.toString()) {
            return res.status(403).json({ "error": 'Not authorized to grade this submission' })
        }

        // Accept both 'grade' and 'score' fields for flexibility
        submission.grade = grade || score
        submission.feedback = feedback || ''
        submission.status = 'graded'
        submission.gradedAt = new Date()
        submission.gradedBy = teacher._id

        await submission.save()

        res.json({ "success": "Submission graded", submission })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error grading submission" })
    }
}

let markLessonComplete = async (req, res) => {
    try {
        const studentId = req.user.id
        const { lessonId } = req.body

        // Verify student is enrolled
        const lesson = await lessonModel.findById(lessonId).populate('subjectId')
        const student = await studentModel.findById(studentId)

        if (!student.courseIds.includes(lesson.subjectId._id)) {
            return res.json({ "error": "Not enrolled in this subject" })
        }

        // Update progress
        await studentModel.updateOne(
            { _id: studentId, "progress.courseId": lesson.subjectId._id },
            {
                $addToSet: {
                    "progress.$.lessonProgress": {
                        lessonId: lessonId,
                        completedAt: new Date()
                    }
                },
                $inc: { "progress.$.completedLessons": 1 }
            }
        )

        res.json({ "success": "Lesson marked as complete" })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error updating lesson progress" })
    }
}

module.exports = {
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
    getAllStudentSubmissions,
    getSubmissionsForLesson,
    gradeSubmission,
    markLessonComplete
}