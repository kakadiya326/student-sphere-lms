const nodemailer = require('nodemailer');
const getEmailTemplate = require('../utils/emailTamplate');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.ADMIN_MAIL,
        pass: process.env.ADMIN_PASSWORD,
    },
    requireTLS: true,
    tls: {
        rejectUnauthorized: false,
    },
    logger: true,
    debug: true,
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Mailer verification failed:', error);
    } else {
        console.log('Mailer is ready to send messages:', success);
    }
});

let sendOTPEmail = async (to, otp) => {
    try {
        if (!process.env.ADMIN_MAIL || !process.env.ADMIN_PASSWORD) {
            console.error('Mail service not configured: ADMIN_MAIL or ADMIN_PASSWORD is missing.');
            return false;
        }

        const mailOptions = {
            from: `"Kakadiya Chiranj" <${process.env.ADMIN_MAIL}>`,
            to,
            subject: "Email Verification",
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
            html: getEmailTemplate(otp),
        }

        let info = await transporter.sendMail(mailOptions);

        if (Array.isArray(info.accepted) && info.accepted.length > 0 && (!info.rejected || info.rejected.length === 0)) {
            return true;
        }

        console.error('OTP email not accepted:', info);
        return false;
    }
    catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
}

module.exports = sendOTPEmail