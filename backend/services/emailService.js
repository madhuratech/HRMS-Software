const nodemailer = require('nodemailer');

async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host: host,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass }
    });
  }

  // Fallback to ethereal auto test transport if environment variables are not set
  const testAccount = await nodemailer.createTestAccount().catch(() => null);
  if (testAccount) {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  // Direct JSON transport as fallback
  return nodemailer.createTransport({
    jsonTransport: true
  });
}

exports.sendOtpEmail = async ({ toEmail, recipientName, otpCode }) => {
  try {
    const transporter = await getTransporter();
    const fromName = process.env.SMTP_FROM || '"HAWKEYE NEST HRMS" <noreply@hawkeyenest.com>';
    const nameDisplay = recipientName || 'Employee';

    const mailOptions = {
      from: fromName,
      to: toEmail,
      subject: 'Your HRMS Email Verification Code',
      text: `Hello ${nameDisplay},\n\nYour HRMS verification code is:\n\n${otpCode}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this verification, please ignore this email.\n\nRegards,\nHAWKEYE NEST HRMS`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">HAWKEYE NEST HRMS</h1>
          </div>
          <div style="padding: 30px 20px; color: #334155;">
            <h2 style="color: #1e293b; margin-top: 0;">Email Verification Code</h2>
            <p style="font-size: 15px; line-height: 1.5;">Hello <strong>${nameDisplay}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.5;">Please use the following 6-digit verification code to complete your HRMS account registration:</p>
            
            <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otpCode}</span>
            </div>

            <p style="font-size: 13px; color: #64748b;">This verification code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            <p style="font-size: 13px; color: #64748b;">If you did not request this code, please safely ignore this email.</p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
            &copy; 2026 HAWKEYE NEST HRMS. All rights reserved.
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Verification OTP sent to ${toEmail} | Message ID: ${info.messageId}`);
    
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[EMAIL PREVIEW URL] ${previewUrl}`);
      }
    }
    return info;
  } catch (err) {
    console.error("[EMAIL SERVICE ERROR]:", err);
    throw err;
  }
};
