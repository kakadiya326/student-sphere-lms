const lessonModel = require("../models/lessonModel");
const subjectModel = require("../models/subjectModel");
const teacherModel = require("../models/teacherModel");
const submissionModel = require("../models/submissionModel");
const studentModel = require("../models/studentModel");

let createLesson = async (req, res) => {
    try {
        const userId = req.user.id
        const { title, description, content, subjectId, order, duration, assignments, resources } = req.body

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "error": "Teacher profile not found" })
        }

        // Verify the subject belongs to this teacher
        const subject = await subjectModel.findOne({ _id: subjectId, teacherId: teacher._id })
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
        console.log(error);
        res.json({ "error": "Error creating lesson" })
    }
}

let getLessonsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params

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

        const lesson = await lessonModel.findById(id).populate('subjectId', 'name code')
        if (!lesson) {
            return res.json({ "error": "Lesson not found" })
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
            return res.json({ "error": "Not authorized to update this lesson" })
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
            return res.json({ "error": "Teacher profile not found" })
        }

        // Find the lesson and verify ownership through subject
        const lesson = await lessonModel.findById(id).populate('subjectId')
        if (!lesson) {
            return res.json({ "error": "Lesson not found" })
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
            return res.json({ "error": "Teacher profile not found" })
        }

        // Verify the subject belongs to this teacher
        const subject = await subjectModel.findOne({ _id: subjectId, teacherId: teacher._id })
        if (!subject) {
            return res.json({ "error": "Subject not found or not authorized" })
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

        if (!lesson.assignments[assignmentIndex]) {
            return res.json({ "error": "Assignment not found" })
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

        // Verify student is enrolled in the subject
        const student = await studentModel.findById(studentId)
        const lesson = await lessonModel.findById(lessonId).populate('subjectId')

        if (!student.courseIds.includes(lesson.subjectId._id)) {
            return res.json({ "error": "Not enrolled in this subject" })
        }

        const submission = await submissionModel.findOneAndUpdate(
            { studentId, lessonId, assignmentIndex },
            {
                answers: answers || [],
                textSubmission: textSubmission || '',
                status: 'submitted',
                submittedAt: new Date(),
                maxPoints: lesson.assignments[assignmentIndex]?.maxPoints || 10
            },
            { upsert: true, new: true }
        )

        res.json({ "success": "Assignment submitted", submission })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error submitting assignment" })
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
        console.log(error);
        res.json({ "error": "Error fetching submissions" })
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
        const { grade, feedback } = req.body

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "error": "Teacher profile not found" })
        }

        const submission = await submissionModel.findById(submissionId).populate({
            path: 'lessonId',
            populate: { path: 'subjectId' }
        })

        if (!submission) {
            return res.json({ "error": "Submission not found" })
        }

        if (submission.lessonId.subjectId.teacherId.toString() !== teacher._id.toString()) {
            return res.json({ "error": "Not authorized to grade this submission" })
        }

        submission.grade = grade
        submission.feedback = feedback
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
    getSubmissionsForLesson,
    gradeSubmission,
    markLessonComplete
}