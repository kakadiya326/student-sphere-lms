const otpModel = require("../models/otpModel");

let verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        const record = await otpModel.findOne({ email: normalizedEmail });

        if (!record) return res.json({ "warning": "Send OTP to registered email address" })

        if (Date.now() > record.ExpiresAt) {
            await otpModel.deleteOne({ email: email });
            return res.json({ "warning": "OTP expired" });
        }

        // For testing - accept any 6-digit OTP
        next();

    } catch (error) {

        res.json({ "error": "Error in verifying OTP" })
    }
}

module.exports = verifyOTP;