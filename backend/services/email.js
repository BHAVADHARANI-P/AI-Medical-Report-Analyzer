const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendAnalysisEmail(analysisResult, originalFileName, severity, emergency_message) {
    if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_password_here') {
        console.warn("Skipping email send because EMAIL_PASS is not configured.");
        return;
    }

    try {
        let severityColor = "#0056b3"; // Default blue
        if (severity === "EMERGENCY") severityColor = "#dc3545"; // Red
        else if (severity === "MID") severityColor = "#fd7e14"; // Orange
        else if (severity === "NORMAL") severityColor = "#28a745"; // Green

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_DEST,
            subject: `[${severity}] AI Medical Analysis Report: ${originalFileName}`,
            text: `Severity: ${severity}\n\n${analysisResult}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #0056b3;">AI Medical Analysis Report</h2>
                    <p><strong>Original File:</strong> ${originalFileName}</p>
                    <p><strong>Severity Level:</strong> <span style="background-color: ${severityColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${severity}</span></p>
                    ${severity === 'EMERGENCY' && emergency_message ? `<div style="background: #ffe5e5; border-left: 4px solid #dc3545; padding: 12px 16px; margin: 12px 0; font-weight: bold; color: #c0392b;">⚠️ ${emergency_message}</div>` : ''}
                    <hr style="border: 1px solid #eee;" />
                    <div style="line-height: 1.6;">
                        ${analysisResult.replace(/\n/g, '<br>')}
                    </div>
                    <hr style="border: 1px solid #eee;" />
                    <p style="font-size: 0.8em; color: #888;">
                        <strong>Disclaimer:</strong> This is an AI-generated analysis based on the provided report. 
                        It is intended for informational purposes only and does not constitute professional medical advice, diagnosis, or treatment. 
                        Always consult with a qualified healthcare professional regarding any medical concerns.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error("Email Error:", error);
        throw new Error("Failed to send email: " + error.message);
    }
}

module.exports = { sendAnalysisEmail };
