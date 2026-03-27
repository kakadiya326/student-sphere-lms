const studentModel = require("../models/studentModel");
const subjectModel = require("../models/subjectModel");
const teacherModel = require("../models/teacherModel");

let createSubject = async (req, res) => {
    try {
        console.log(req.body, req.user);
        let subject = await subjectModel.findOne({ "code": req.body.code })
        if (subject) {
            return res.json({ "error": "Subject with this code already exists" })
        }
        let teacher = await teacherModel.findOne({ _id: req.user.id })
        if (!teacher) {
            return res.json({ "error": "Please!! update your profile" })
        }
        subject = new subjectModel({ ...req.body, teacherId: req.user.id })
        await subject.save()
        // await subject.populate("teacherId", "name email")
        await teacherModel.findOneAndUpdate({ _id: req.user.id }, { $push: { subjects: subject._id } })
        res.json({ "success": "Subject created successfully", subject })

    } catch (error) {
        console.log(error);
        res.json({ "error": "Error creating subject" })
    }
}

let getSubjects = async (req, res) => {
    try {
        let subjects = await subjectModel.find().populate({
            path: "teacherId",
            populate: {
                path: "userId",
                select: "name email"
            }
        })
        res.json({ "success": "Subjects retrieved successfully", subjects })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error retrieving subjects" })
    }
}

let updateSubject = async (req, res) => {
    try {
        let subject = await subjectModel.findOneAndUpdate({ _id: req.params.id }, { ...req.body }, { new: true })
        res.json({ "success": "Subject updated successfully", subject });
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error updating subject" })
    }
}

let deleteSubject = async (req, res) => {
    try {
        let subject = await subjectModel.findOneAndDelete({ _id: req.params.id })
        res.json({ "success": "Subject deleted successfully", subject });
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error deleting subject" })
    }
}

let getMySubjects = async (req, res) => {
    try {
        let subjects = await subjectModel.find({ teacherId: req.user.id })
        if (subjects.length === 0) return res.json({ "msg": "NO subjects assigned to you yet" })
        res.json({ "success": "Subjects retrieved successfully", subjects })

    } catch (error) {
        console.log(error);
        res.json({ "error": "Error getting subject of logged-in teacher" })
    }
}

//in Use
let mySubjects = async (req, res) => {
    try {
        const studentId = req.user.id
        let student = await studentModel.findById(studentId).populate("courseIds")
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
                $inc:{"progress.$.completedLessons":1}
            }
        )

        res.json({ "success": "Progress updated" })
    } catch (error) {
        console.log(error);
        res.json({ "error": "Error updating progress" })
    }
}
module.exports = { createSubject, getSubjects, updateSubject, deleteSubject, getMySubjects, mySubjects, updateProgress }