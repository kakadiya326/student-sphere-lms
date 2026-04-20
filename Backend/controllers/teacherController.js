const teacherModel = require('../models/teacherModel')

let getProfile = async (req, res) => {
    try {
        const teacher = await teacherModel.findOne({ userId: req.user.id }).populate('userId', 'name email profilePic').populate('subjects')

        res.json({ teacher })

    } catch (error) {
        res.json({ "error": "Error fetching profile" })
    }
}

let profileUpdate = async (req, res) => {
    try {

        const teacher = await teacherModel.findOneAndUpdate(
            { userId: req.user.id },
            { ...req.body, userId: req.user.id },
            {
                new: true,
                upsert: true
            }
        ).populate('userId', 'name email profilePic').populate('subjects')

        res.json({
            "success": "Profile updated",
            teacher
        })

    } catch (error) {

        res.json({ "error": "Error updating profile" })
    }
}

module.exports = { getProfile, profileUpdate }