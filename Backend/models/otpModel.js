const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String,
    ExpiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('otp', otpSchema);