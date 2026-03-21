// controllers/sendOTP.js
const otpModel = require('../models/otpModel');
const generateOTP = require('../utils/generateOtp');
const sendOTPEmail = require('../utils/mailService');

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // ⏱️ Resend restriction (60 sec)
        const existing = await otpModel.findOne({ email: email });

        if (existing && Date.now() < existing.createdAt.getTime() + 60000) {
            return res.json({ "msg": "Wait 60 seconds before requesting again" });
        }

        const otp = generateOTP();

        // Remove old OTP
        await otpModel.deleteMany({ email: email });

        // Save new OTP
        await otpModel.create({
            email: email,
            otp: otp,
            ExpiresAt: Date.now() + 5 * 60 * 1000
        });

        let result = await sendOTPEmail(email, otp);
        if (!result) {
            return res.json({ "msg": "Failed to send OTP" });
        } else {
            return res.json({ "msg": "OTP sent successfully" });
        }

    } catch (err) {
        console.log(err);
        res.json({ "msg": "Failed to send OTP" });
    }
};

module.exports = sendOTP;