// controllers/sendOTP.js
const otpModel = require('../models/otpModel');
const userModel = require('../models/userModel');
const generateOTP = require('../utils/generateOtp');
const sendOTPEmail = require('../utils/mailService');

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({ "error": "Email is required." });
        }

        // Check if email is already registered
        const existingUser = await userModel.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ "warning": "This email is already registered. Please login instead." });
        }

        // ⏱️ Resend restriction (60 sec)
        const existing = await otpModel.findOne({ email: normalizedEmail });

        if (existing && Date.now() < existing.createdAt.getTime() + 60000) {
            return res.status(429).json({ "warning": "Wait 60 seconds before requesting again" });
        }

        const otp = generateOTP();

        // Remove old OTP
        await otpModel.deleteMany({ email: normalizedEmail });

        // Save new OTP
        const otpRecord = await otpModel.create({
            email: normalizedEmail,
            otp: otp,
            ExpiresAt: Date.now() + 5 * 60 * 1000
        });

        const emailSent = await sendOTPEmail(normalizedEmail, otp);
        if (!emailSent) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(500).json({ "error": "Failed to send OTP email. Please verify email configuration and try again." });
        }

        return res.json({ "success": "OTP sent successfully", "otpFlag": true });

    } catch (err) {
        res.status(500).json({ "error": "Failed to send OTP" });
    }
};

module.exports = sendOTP;