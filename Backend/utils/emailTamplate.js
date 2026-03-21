const getEmailTemplate = (otp) => {
    return `
    <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
        <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:10px; text-align:center;">
            
            <h2 style="color:#333;">Email Verification</h2>
            
            <p style="color:#555;">
                Use the OTP below to verify your email address.
            </p>

            <div style="font-size:30px; font-weight:bold; color:#4CAF50; margin:20px 0;">
                ${otp}
            </div>

            <p style="color:#777;">
                This OTP is valid for 5 minutes.
            </p>

            <hr/>

            <p style="font-size:12px; color:#aaa;">
                If you didn’t request this, you can ignore this email.
            </p>
        </div>
    </div>
    `;
};

module.exports = getEmailTemplate;