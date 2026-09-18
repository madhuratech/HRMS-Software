const nodemailer = require('nodemailer');

async function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const secure = process.env.SMTP_SECURE === 'true'; // false for 587 STARTTLS
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');

  if (!user || !pass) {
    throw new Error('SMTP credentials missing: Please ensure SMTP_USER and SMTP_PASS are configured in backend/.env');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  // Verify transporter connectivity and credentials before sending
  await transporter.verify();

  return transporter;
}

exports.sendOtpEmail = async ({ toEmail, recipientName, otpCode }) => {
  const transporter = await getTransporter();
  const smtpUser = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const fromEmail = smtpUser || 'noreply@madhuratech.com';
  const fromName = process.env.SMTP_FROM || `"Madhura HRMS" <${fromEmail}>`;
  const nameDisplay = recipientName || 'Customer';

  // Send OTP to the actual customer's email address
  const targetRecipient = toEmail;

  if (!targetRecipient) {
    throw new Error('Recipient email is required to dispatch verification OTP.');
  }

  const mailOptions = {
    from: fromName,
    to: targetRecipient,
    subject: 'Madhura HRMS - Your Email Verification Code',
    text: `Hello ${nameDisplay},\n\nYour 6-digit Madhura HRMS verification code is:\n\n${otpCode}\n\nThis code is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nRegards,\nMadhura HRMS Team`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #1e40af, #2563eb); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 18px; margin-bottom: 12px;">
            <span style="color: #fff; font-size: 18px; font-weight: 900; letter-spacing: -0.5px;">Madhura<span style="color: #93c5fd;">HRMS</span></span>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Email Verification Code</h1>
        </div>
        <div style="background: #ffffff; padding: 36px 28px; color: #334155; border: 1px solid #e2e8f0; border-top: none;">
          <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hello <strong>${nameDisplay}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #64748b;">You are registering for a Free Trial of Madhura HRMS. Use the verification code below to confirm your email address:</p>
          
          <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #bfdbfe; border-radius: 12px; padding: 28px; text-align: center; margin: 24px 0;">
            <div style="font-size: 13px; color: #3b82f6; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Your OTP Code</div>
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #1d4ed8; font-family: monospace;">${otpCode}</span>
            <div style="font-size: 12px; color: #64748b; margin-top: 10px;">Valid for 10 minutes</div>
          </div>

          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Do not share this code with anyone. If you did not request this verification, you can safely ignore this email.</p>
        </div>
        <div style="padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 12px;">
          &copy; 2026 Madhura Technologies. All rights reserved.
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[OTP EMAIL] Verification code sent to ${targetRecipient} | Message ID: ${info.messageId}`);
  return info;
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

exports.sendActivationEmail = async ({ toEmail, recipientName, activationUrl }) => {
  const transporter = await getTransporter();
  const smtpUser = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const fromEmail = smtpUser || 'noreply@madhuratech.com';
  const fromName = process.env.SMTP_FROM || `"Madhura HRMS" <${fromEmail}>`;
  const nameDisplay = recipientName || 'Customer';

  const mailOptions = {
    from: fromName,
    to: toEmail,
    subject: 'Madhura HRMS - Activate Your 3-Hour Demo',
    text: `Hello ${nameDisplay},\n\nYour registration is verified. Please use the following link to activate your 3-Hour Super Admin Demo Workspace:\n\n${activationUrl}\n\nThis link will securely open your setup form.\n\nRegards,\nMadhura HRMS Team`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Demo Activation</h1>
        </div>
        <div style="background: #ffffff; padding: 36px 28px; color: #334155; border: 1px solid #e2e8f0; border-top: none;">
          <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hello <strong>${nameDisplay}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #64748b;">Your email has been successfully verified! You are just one step away from launching your 3-Hour Super Admin Workspace.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${activationUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #059669, #047857); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 12px rgba(5,150,105,0.25);">
              Accept & Activate Demo Workspace
            </a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">If the button above does not work, copy and paste the following URL into your browser:<br/><br/>
          <span style="color: #3b82f6; word-break: break-all;">${activationUrl}</span></p>
        </div>
        <div style="padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 12px;">
          &copy; 2026 Madhura Technologies. All rights reserved.
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[ACTIVATION EMAIL] Sent to ${toEmail} | Message ID: ${info.messageId}`);
  return info;
};
exports.sendActivationEmail = async ({ toEmail, recipientName, activationUrl }) => {
  const transporter = await getTransporter();
  const smtpUser = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const fromEmail = smtpUser || 'noreply@madhuratech.com';
  const fromName = process.env.SMTP_FROM || `"Madhura HRMS" <${fromEmail}>`;
  const nameDisplay = recipientName || 'Customer';

  const mailOptions = {
    from: fromName,
    to: toEmail,
    subject: 'Madhura HRMS - Activate Your 3-Hour Demo',
    text: `Hello ${nameDisplay},\n\nYour registration is verified. Please use the following link to activate your 3-Hour Super Admin Demo Workspace:\n\n${activationUrl}\n\nThis link will securely open your setup form.\n\nRegards,\nMadhura HRMS Team`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Demo Activation</h1>
        </div>
        <div style="background: #ffffff; padding: 36px 28px; color: #334155; border: 1px solid #e2e8f0; border-top: none;">
          <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hello <strong>${nameDisplay}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #64748b;">Your email has been successfully verified! You are just one step away from launching your 3-Hour Super Admin Workspace.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${activationUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #059669, #047857); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 12px rgba(5,150,105,0.25);">
              Accept & Activate Demo Workspace
            </a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">If the button above does not work, copy and paste the following URL into your browser:<br/><br/>
          <span style="color: #3b82f6; word-break: break-all;">${activationUrl}</span></p>
        </div>
        <div style="padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 12px;">
          &copy; 2026 Madhura Technologies. All rights reserved.
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[ACTIVATION EMAIL] Sent to ${toEmail} | Message ID: ${info.messageId}`);
  return info;
};
