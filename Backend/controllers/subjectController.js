const subjectModel = require("../models/subjectModel");
const teacherModel = require("../models/teacherModel");
const studentModel = require("../models/studentModel");

let createSubject = async (req, res) => {
    try {
        const userId = req.user.id
        const { name, code } = req.body

        // Find or create teacher document
        let teacher = await teacherModel.findOneAndUpdate(
            { userId: userId },
            { userId: userId },
            { upsert: true, new: true }
        )

        // teacherId must reference teacher document (_id), not userId
        let subject = new subjectModel({ name, code, teacherId: teacher._id })

        await subject.save()

        await teacherModel.findByIdAndUpdate(
            teacher._id,
            { $addToSet: { subjects: subject._id } }
        )

        res.status(201).json({ "success": 'Subject created', subject })
    } catch (error) {
        console.error(error)
        res.status(500).json({ "error": 'Error creating subject' })
    }
}

let getSubjects = async (req, res) => {
    try {
        const { search } = req.query
        let filter = {}
        if (search) {
            filter.name = { $regex: search, $options: "i" }
        }

        if (req.user.role === 'teacher') {
            // Find the teacher document
            const teacher = await teacherModel.findOne({ userId: req.user.id })
            if (!teacher) {
                return res.json({ subjects: [] })
            }
            filter.teacherId = teacher._id
        }

        let subjects = await subjectModel
            .find(filter)
            .populate({
                path: "teacherId",
                populate: {
                    path: "userId",
                    select: "name email"
                }
            })
        res.json({ subjects })

    } catch (error) {
        console.log(error);
        res.json({ "error": "Error fetching subjects" })
    }
}

let updateSubject = async (req, res) => {
    try {
        const userId = req.user.id;
        const subjectId = req.params?.id;

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "warning": "Update your profile." })
        }

        if (!subjectId) return res.json({ "warning": "Subject id not selected" })

        let subject = await subjectModel.findOneAndUpdate(
            { _id: subjectId, teacherId: teacher._id },
            req.body,
            { new: true }
        )

        if (!subject) {
            return res.status(403).json({ "error": 'Not authorized or not found' })
        }

        res.json({ "success": 'Subject updated', subject })
    } catch (error) {
        console.error(error)
        res.status(500).json({ "error": 'Error updating subject' })
    }
}

let deleteSubject = async (req, res) => {
    try {
        const userId = req.user.id

        // Find the teacher document
        // const teacher = await teacherModel.findOne({ userId: userId })
        // if (!teacher) {
        //     return res.json({ "error": "Teacher profile not found" })
        // }

        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "error": "Teacher profile not found" })
        }

        let subject = await subjectModel.findOneAndDelete({
            _id: req.params.id,
            teacherId: teacher._id
        })

        if (!subject) {
            return res.status(403).json({ "error": 'Not authorized or not found' })
        }

        await teacherModel.findByIdAndUpdate(
            teacher._id,
            { $pull: { subjects: req.params.id } }
        )

        res.json({ "success": 'Subject deleted' })

    } catch (e) {
        console.error(e)
        res.status(500).json({ "error": 'Error deleting subject' })
    }
}

//in Use
let mySubjects = async (req, res) => {
    try {
        const studentId = req.user.id
        let student = await studentModel.findById(studentId)
        if (!student) {
            return res.status(400).json({ "error": "Please complete your profile first" })
        }

        student = await studentModel.findById(studentId)
            .populate({
                path: "courseIds",
                select: "name code teacherId",
                populate: {
                    path: "teacherId",
                    select: "department userId",
                    populate: {
                        path: "userId",
                        select: "name email"
                    }
                }
            })

        res.json({ "success": "All enrolled subjects fetched", "subjects": student.courseIds, "progress": student.progress })
    } catch (error) {
        console.log(error);
        res.status(500).json({ "error": "Your enrolled subjects not fetched." })
    }
}


//In use
let updateProgress = async (req, res) => {
    try {
        const studentId = req.user.id
        const { courseId, completedLessons } = req.body
        // Check if student profile exists
        const studentExists = await studentModel.findById(studentId)
        if (!studentExists) {
            return res.status(400).json({ "error": "Please complete your profile first" })
        }
        await studentModel.updateOne(
            { _id: studentId, "progress.courseId": courseId },
            {
                $inc: { "progress.$.completedLessons": 1 }
            }
        )

        res.json({ "success": "Progress updated" })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error updating progress" })
    }
}

let enrollInSubject = async (req, res) => {
    try {
        const studentId = req.user.id
        const { courseId } = req.body

        // Check if student profile exists
        const studentExists = await studentModel.findById(studentId)
        if (!studentExists) {
            return res.status(400).json({ "error": "Please complete your profile first" })
        }

        let student = await studentModel.findByIdAndUpdate(
            studentId,
            {
                $addToSet: { courseIds: courseId }//to avoid duplicate
            },
            { new: true }
        )
        res.json({ "success": "Enrolled successfully", student })
    } catch (error) {
        console.log(error);
        res.status(500).json({ "error": "Something went wrong." })
    }
}

let unenrollFromSubject = async (req, res) => {
    try {
        const studentId = req.user.id
        const { courseId } = req.body
        // Check if student profile exists
        const studentExists = await studentModel.findById(studentId)
        if (!studentExists) {
            return res.status(400).json({ "error": "Please complete your profile first" })
        }
        let student = await studentModel.findByIdAndUpdate(
            studentId,
            {
                $pull: { courseIds: courseId, progress: { courseId: courseId } }
            },
            { new: true }
        )

        res.json({ "success": "Unenrolled successfully", student })
    } catch (error) {
        console.log(error)
        res.json({ "error": "Something went wrong." })
    }
}
module.exports = { createSubject, getSubjects, updateSubject, deleteSubject, mySubjects, updateProgress, enrollInSubject, unenrollFromSubject }