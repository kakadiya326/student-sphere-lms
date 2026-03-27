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

        let subject = new subjectModel({ name, code, teacherId: teacher._id })

        await subject.save()

        await teacherModel.findByIdAndUpdate(
            teacher._id,
            { $push: { subjects: subject._id } }
        )

        res.json({ "success": "Subject created" })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error creating subject" })
    }
}

let getSubjects = async (req, res) => {
    try {
        const { search } = req.query
        let filter = {}
        if (search) {
            filter.name = { $regex: search, $options: "i" }
        }

        let subjects = await subjectModel
            .find(filter)
            .populate({
                path: "teacherId", // 👉 first populate teacher
                populate: {
                    path: "userId", // 👉 then populate user inside teacher
                    select: "name email"
                }
            })


        console.log(subjects);
        res.json({ subjects })

    } catch (error) {
        console.log(error);
        res.json({ "error": "Error fetching subjects" })
    }
}

let updateSubject = async (req, res) => {
    try {
        const userId = req.user.id

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "error": "Teacher profile not found" })
        }

        let subject = await subjectModel.findOneAndUpdate(
            { _id: req.params.id, teacherId: teacher._id },
            req.body,
            { new: true }
        )

        if (!subject) {
            return res.json({ "error": "Not authorized or not found" })
        }

        res.json({ "success": "Subject updated", subject })
    } catch (error) {
        res.json({ "error": "Error updating subject" })
    }
}

let deleteSubject = async (req, res) => {
    try {
        const userId = req.user.id

        // Find the teacher document
        const teacher = await teacherModel.findOne({ userId: userId })
        if (!teacher) {
            return res.json({ "error": "Teacher profile not found" })
        }

        let subject = await subjectModel.findOneAndDelete({
            _id: req.params.id,
            teacherId: teacher._id
        })

        if (!subject) {
            return res.json({ "error": "Not authorized or not found" })
        }

        await teacherModel.findByIdAndUpdate(
            teacher._id,
            { $pull: { subjects: req.params.id } }
        )

        res.json({ "success": "Subject deleted" })

    } catch (e) {
        res.json({ "error": "Error deleting subject" })
    }
}

//in Use
let mySubjects = async (req, res) => {
    try {
        const studentId = req.user.id
        let student = await studentModel.findById(studentId)
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
        console.log(student);

        res.json({ "success": "All enrolled subjects fetched", "subjects": student.courseIds, "progress": student.progress })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Your enrolled subjects not fetched." })
    }
}


//In use
let updateProgress = async (req, res) => {
    try {
        const studentId = req.user.id
        const { courseId, completedLessons } = req.body

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
        res.json({ "error": "Something went wrong." })
    }
}

let unenrollFromSubject = async (req, res) => {
    try {
        const studentId = req.user.id
        const { courseId } = req.body

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