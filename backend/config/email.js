const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL || process.env.SMTP_USER,
            to,
            subject,
            html
        });
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

const getPasswordResetEmail = (resetUrl) => {
    return `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #2563eb; text-align: center;">Password Reset Request</h2>
            <p>You have requested to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Reset Password
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email. This link will expire in 1 hour.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">AI CV Categorization System</p>
        </div>
    `;
};

const getVerificationEmail = (verifyUrl) => {
    return `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #2563eb; text-align: center;">Verify Your Email</h2>
            <p>Welcome to AI CV Categorization System! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Verify Email
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">If you did not create an account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">AI CV Categorization System</p>
        </div>
    `;
};

module.exports = { sendEmail, getPasswordResetEmail, getVerificationEmail };
