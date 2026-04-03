// controllers/sendOTP.js
const otpModel = require('../models/otpModel');
const generateOTP = require('../utils/generateOtp');
const sendOTPEmail = require('../utils/mailService');

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        console.log('-------------------------------------------------------', req, req.body);

        // ⏱️ Resend restriction (60 sec)
        const existing = await otpModel.findOne({ email: email });

        if (existing && Date.now() < existing.createdAt.getTime() + 60000) {
            return res.json({ "warning": "Wait 60 seconds before requesting again" });
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
            return res.json({ "error": "Failed to send OTP" });
        } else {
            return res.json({ "success": "OTP sent successfully", "otpFlag": true });
        }

    } catch (err) {
        console.log(err);
        res.json({ "error": "Failed to send OTP" });
    }
};

module.exports = sendOTP;