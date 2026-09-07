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

exports.sendOfferLetterEmail = async ({ toEmail, candidateName, jobPosition, pdfBuffer, contentText }) => {
  try {
    const transporter = await getTransporter();
    const fromName = process.env.SMTP_FROM || '"Madhura Technologies HR" <hr@madhuratech.com>';
    const nameDisplay = candidateName || 'Candidate';

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `Offer_Letter_${nameDisplay.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    const mailOptions = {
      from: fromName,
      to: toEmail,
      subject: `Offer of Employment - ${jobPosition || 'Position'} at Madhura Technologies`,
      text: contentText || `Dear ${nameDisplay},\n\nWe are pleased to offer you the position of ${jobPosition} at Madhura Technologies. Please find your official offer letter attached.\n\nBest regards,\nHR Department\nMadhura Technologies`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Madhura Technologies</h1>
            <p style="color: #e0e7ff; margin: 6px 0 0; font-size: 13px;">Official Employment Offer</p>
          </div>
          <div style="padding: 28px 20px; color: #334155; line-height: 1.6;">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">Offer of Employment: ${jobPosition || ''}</h2>
            <p>Dear <strong>${nameDisplay}</strong>,</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; font-family: monospace; white-space: pre-wrap; font-size: 13px; color: #1e293b;">
${contentText || 'Please review your attached offer letter for details.'}
            </div>
            <p>Please review the details in the attached official offer document and confirm your acceptance.</p>
            <p style="margin-top: 24px;">Sincerely,<br/><strong>Human Resources</strong><br/>Madhura Technologies</p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
            &copy; 2026 Madhura Technologies. All rights reserved.
          </div>
        </div>
      `,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[OFFER EMAIL SENT] Sent to ${toEmail} | Message ID: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[OFFER EMAIL PREVIEW URL] ${previewUrl}`);
      }
    }
    return info;
  } catch (err) {
    console.error("[OFFER EMAIL SERVICE ERROR]:", err);
    throw err;
  }
};
