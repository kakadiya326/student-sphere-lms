const otpModel = require("../models/otpModel");

let verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const record = await otpModel.findOne({ email: email });

        if (!record) return res.json({ "warning": "Send OTP to registered email address" })

        if (Date.now() > record.ExpiresAt) {
            await otpModel.deleteOne({ email: email });
            return res.json({ "warning": "OTP expired" });
        }

        if (record.otp !== otp) return res.json({ "error": "Invalid OTP" })

        await otpModel.deleteOne({ email: email });
        next();

    } catch (error) {
        console.log(error);
        res.json({ "error": "Error in verifying OTP" })
    }
}

module.exports = verifyOTP;