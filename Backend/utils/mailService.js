const nodemailer = require('nodemailer');
const getEmailTemplate = require('../utils/emailTamplate');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.ADMIN_MAIL,
        pass: process.env.ADMIN_PASSWORD,
    },
});

let sendOTPEmail = async (to, otp) => {
    try {

        const mailOptions = {
            from: `"Kakadiya Chiranj" <${process.env.ADMIN_MAIL}>`,
            to: to,
            subject: "Email Verification",
            html: getEmailTemplate(otp),
        }

        let info = await transporter.sendMail(mailOptions);

        if (info.accepted.length > 0 && info.rejected.length === 0) {
            return true;
        } else {
            return false;
        }
    }
    catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = sendOTPEmail