let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

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

        // let isMatch = await bcrypt.compare(password, user.password)
        // if (!isMatch) {
        //     return res.status(401).json({ "warning": "Password not matched." })
        // }
        console.log({ id: user._id, role: user.role, name: user.name });
        let token = await jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
        res.json({ "success": "Login success", "userData": { ...user._doc, "password": "" }, token })
    } catch (e) {
        console.log(e);
        res.status(500).json({ "error": "Error in login" })
    }
}

module.exports = { register, login }