const studentModel = require('../models/studentModel')
const { generateEnrollment } = require('../models/genEnroll')


// ✅ Create / Update Profile
let updateStudentProfile = async (req, res) => {
    try {
        const studentId = req.user.id

        let updateData = { ...req.body }

        // Get existing student
        const existingStudent = await studentModel.findById(studentId)

        // If department is being updated, regenerate enrollment
        if (req.body.department && (!existingStudent || existingStudent.department !== req.body.department)) {
            updateData.enrollment = await generateEnrollment(req.body.department)
        }

        const student = await studentModel.findByIdAndUpdate(
            studentId,
            updateData,
            {
                new: true,
                upsert: true
            }
        )

        res.json({
            success: existingStudent ? "Profile updated" : "Profile completed",
            student
        })

    } catch (error) {

        res.json({ "error": "Error updating profile" })
    }
}


// ✅ Get Profile
let getStudentProfile = async (req, res) => {
    try {
        const student = await studentModel.findById(req.user.id).populate('_id', 'name email profilePic')

        res.json({ student })

    } catch (error) {
        res.json({ "error": "Error fetching profile" })
    }
}

module.exports = {
    updateStudentProfile,
    getStudentProfile
}