let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const fs = require('fs')
const path = require('path')

let register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        let user = await userModel.findOne({ email })
        if (user) {
            return res.status(409).json({ "warning": "User already exists." })
        } else {
            let pwdHash = await bcrypt.hash(password, 10)
            let data = new userModel({
                name,
                email,
                password: pwdHash,
                role: req.body.role || 'student'
            })
            await data.save()
            res.json({ "success": "Registered successfully!!" })
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ "error": "Error in registration" })
    }
}

let login = async (req, res) => {
    try {
        const { email, password } = req.body
        let user = await userModel.findOne({ email })
        if (!user) {
            return res.status(401).json({ "warning": "User doesn't exists." })
        }

        let isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ "warning": "Password not matched." })
        }
        let token = await jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
        res.json({ "success": "Login success", "userData": { ...user._doc, "password": "" }, token })
    } catch (e) {
        console.log(e);
        res.status(500).json({ "error": "Error in login" })
    }
}

const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ "error": 'No file uploaded' })
        }

        const userId = req.user?.id || req.body.id
        if (!userId) {
            return res.status(400).json({ "error": 'User id missing' })
        }

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ "error": "User not found." })
        console.log(user);
        if (user.profilePic) {
            const oldPath = path.join(__dirname, '../profilePics', user.profilePic)
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath)
                console.log('Old image deleted:', user.profilePic)
            } else {
                console.log('else part Old image deleted:', user.profilePic)
            }

        }

        const profilePicPath = req.file.filename

        // await userModel.findByIdAndUpdate(userId, { profilePic: profilePicPath })
        user.profilePic = profilePicPath
        await user.save();

        res.json({ "success": 'Profile picture uploaded successfully', profilePicPath })
    } catch (error) {
        console.error(error)
        res.status(500).json({ "error": 'Error uploading profile picture' })
    }
}

module.exports = { register, login, uploadProfilePic }