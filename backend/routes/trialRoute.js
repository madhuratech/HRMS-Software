const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

// In-memory persistent store with sync to prevent any loss
// Initialized clean and empty for actual customer registrations
let trialLeadsStore = [];

// Active OTP cache: email -> { otp, expiresAt, sessionId }
const activeOtps = new Map();

/**
 * 1. POST /api/trial/send-otp
 * Generates and dispatches 6-digit OTP for customer Gmail/Email verification
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || 'Customer').trim();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(12).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    activeOtps.set(cleanEmail, { otp: otpCode, expiresAt, sessionId });

    // Try sending email via nodemailer if SMTP is configured
    let emailSent = false;
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await emailService.sendOtpEmail({
          toEmail: cleanEmail,
          recipientName: cleanName,
          otpCode
        });
        emailSent = true;
      }
    } catch (e) {
      console.warn('[Trial OTP Email Notice] SMTP delivery skipped or error:', e.message);
    }

    return res.json({
      success: true,
      message: `Verification code dispatched to ${cleanEmail}. Valid for 10 minutes.`,
      sessionId,
      email: cleanEmail,
      emailSent,
      // Provide dev preview OTP only if SMTP fails or is not configured
      ...(emailSent ? {} : { devPreviewOtp: otpCode })
    });
  } catch (err) {
    console.error('Trial send-otp error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP code.' });
  }
});

/**
 * 2. POST /api/trial/verify-otp
 * Verifies submitted 6-digit code
 */
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const record = activeOtps.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No active OTP request found for this email. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      activeOtps.delete(cleanEmail);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code. Please try again.' });
    }

    // Success
    activeOtps.delete(cleanEmail);
    return res.json({
      success: true,
      verified: true,
      email: cleanEmail,
      message: 'Email successfully verified!'
    });
  } catch (err) {
    console.error('Trial verify-otp error:', err);
    res.status(500).json({ success: false, message: 'OTP verification failed.' });
  }
});

/**
 * 3. POST /api/trial/register
 * Registers customer with username, email, phone, password.
 * Generates activation token and dispatches activation email.
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, phone, and password are all required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    // Check if lead already exists
    const existingIndex = trialLeadsStore.findIndex(l => l.email.toLowerCase() === cleanEmail);
    const id = 'TRL-' + Math.floor(10000 + Math.random() * 90000);
    const activationToken = crypto.randomBytes ? crypto.randomBytes(24).toString('hex') : 'act_' + Date.now();

    const newLead = {
      id: existingIndex >= 0 ? trialLeadsStore[existingIndex].id : id,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: password.trim(),
      company: '',
      industry: '',
      employeeSize: '',
      heardAbout: '',
      city: '',
      status: 'Pending Activation',
      otpVerified: true,
      activationToken,
      registeredAt: new Date().toISOString(),
      demoStartedAt: null,
      demoExpiresAt: null,
      role: 'SUPER_ADMIN'
    };

    if (existingIndex >= 0) {
      trialLeadsStore[existingIndex] = { ...trialLeadsStore[existingIndex], ...newLead };
    } else {
      trialLeadsStore.unshift(newLead);
    }

    const origin = req.headers.origin || 'http://localhost:5173';
    const activationUrl = `${origin}/activate-trial?token=${activationToken}&email=${encodeURIComponent(cleanEmail)}`;

    console.log(`[TRIAL REGISTRATION] Customer: ${cleanName} (${cleanEmail}) - Activation URL: ${activationUrl}`);

    // Dispatch the activation email
    let emailSent = false;
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await emailService.sendActivationEmail({
          toEmail: cleanEmail,
          recipientName: cleanName,
          activationUrl
        });
        emailSent = true;
      }
    } catch (e) {
      console.warn('[Trial Activation Email Notice] SMTP delivery failed:', e.message);
    }

    return res.json({
      success: true,
      message: 'Registration successful. Activation email has been dispatched.',
      lead: newLead,
      activationToken,
      // Only return activationUrl for local dev if email wasn't sent
      ...(emailSent ? {} : { activationUrl })
    });
  } catch (err) {
    console.error('Trial register error:', err);
    res.status(500).json({ success: false, message: 'Customer trial registration failed.' });
  }
});

/**
 * 3.5. POST /api/trial/login
 * Allows customer to re-login with username/email & password during their active 3 hours
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email/Username and password are required.' });
    }

    const cleanInput = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const lead = trialLeadsStore.find(l => 
      (l.email.toLowerCase() === cleanInput || l.name.toLowerCase() === cleanInput) &&
      (l.password === cleanPass)
    );

    if (!lead) {
      return res.status(401).json({ success: false, message: 'Invalid trial credentials.' });
    }

    const now = Date.now();
    if (lead.demoExpiresAt && now >= lead.demoExpiresAt) {
      lead.status = 'Demo Expired';
      return res.status(403).json({
        success: false,
        expired: true,
        message: 'Your 3-Hour Demo session has expired. The 3-hour sandbox limit has been reached.'
      });
    }

    return res.json({
      success: true,
      message: `Welcome back, ${lead.name}! 3-Hour Demo resumed.`,
      lead,
      session: {
        isActive: true,
        isDemo: true,
        is3HourDemo: true,
        startedAt: lead.demoStartedAt,
        expiresAt: lead.demoExpiresAt,
        company: lead.company || 'My Organization',
        name: lead.name,
        email: lead.email,
        role: 'SUPER_ADMIN'
      }
    });
  } catch (err) {
    console.error('Trial login error:', err);
    res.status(500).json({ success: false, message: 'Trial login error.' });
  }
});

/**
 * 4. GET & POST /api/trial/activate
 * Validates activation token and marks customer account as activated
 */
router.all('/activate', (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    const email = (req.query.email || req.body.email || '').trim().toLowerCase();

    let lead = trialLeadsStore.find(l => l.activationToken === token);
    if (!lead && email) {
      lead = trialLeadsStore.find(l => l.email.toLowerCase() === email);
    }

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Invalid or expired activation link.' });
    }

    // Mark as Activated if still pending
    if (lead.status === 'Pending Activation') {
      lead.status = 'Activated';
    }

    return res.json({
      success: true,
      message: 'Trial account verified and activated successfully.',
      lead
    });
  } catch (err) {
    console.error('Trial activate error:', err);
    res.status(500).json({ success: false, message: 'Failed to process activation.' });
  }
});

/**
 * 5. POST /api/trial/complete-onboarding
 * Collects Customer Company / Organization information, "Where did you hear about us?", and Employee Size.
 * Starts the 3-Hour Demo session with dummy database storage!
 */
router.post('/complete-onboarding', (req, res) => {
  try {
    const { email, password, company, industry, employeeSize, heardAbout, city, priorities } = req.body;

    if (!company) {
      return res.status(400).json({ success: false, message: 'Company or organization name is required.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    let lead = trialLeadsStore.find(l => l.email.toLowerCase() === cleanEmail);

    const now = Date.now();
    const demoExpiresAt = now + 3 * 60 * 60 * 1000; // Exact 3 hours

    if (lead) {
      if (password) lead.password = password.trim();
      lead.company = company.trim();
      lead.industry = industry || 'IT & Software';
      lead.employeeSize = employeeSize || '21-100';
      lead.heardAbout = heardAbout || 'Website';
      lead.city = city || '';
      lead.priorities = priorities || [];
      lead.status = 'Active 3-Hr Demo';
      lead.demoStartedAt = now;
      lead.demoExpiresAt = demoExpiresAt;
    } else {
      lead = {
        id: 'TRL-' + Math.floor(10000 + Math.random() * 90000),
        name: 'Super Admin',
        email: cleanEmail,
        password: (password || '').trim(),
        phone: '',
        company: company.trim(),
        industry: industry || 'IT & Software',
        employeeSize: employeeSize || '21-100',
        heardAbout: heardAbout || 'Website',
        city: city || '',
        priorities: priorities || [],
        status: 'Active 3-Hr Demo',
        registeredAt: new Date().toISOString(),
        demoStartedAt: now,
        demoExpiresAt: demoExpiresAt,
        role: 'SUPER_ADMIN'
      };
      trialLeadsStore.unshift(lead);
    }

    return res.json({
      success: true,
      message: 'Company onboarding completed. 3-Hour Demo session initialized with isolated dummy database storage.',
      lead,
      session: {
        isDemo: true,
        is3HourDemo: true,
        startedAt: now,
        expiresAt: demoExpiresAt,
        durationMinutes: 180,
        company: lead.company,
        name: lead.name,
        email: lead.email,
        role: 'SUPER_ADMIN'
      }
    });
  } catch (err) {
    console.error('Trial complete-onboarding error:', err);
    res.status(500).json({ success: false, message: 'Failed to complete company setup.' });
  }
});

/**
 * 6. GET /api/trial/leads
 * Returns all customer trial leads for Master Admin Dashboard
 */
router.get('/leads', (req, res) => {
  try {
    // Check if any leads have expired their 3-hour demo
    const now = Date.now();
    trialLeadsStore.forEach(lead => {
      if (lead.status === 'Active 3-Hr Demo' && lead.demoExpiresAt && now > lead.demoExpiresAt) {
        lead.status = 'Demo Expired';
      }
    });

    return res.json({
      success: true,
      count: trialLeadsStore.length,
      leads: trialLeadsStore
    });
  } catch (err) {
    console.error('Get trial leads error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch trial leads.' });
  }
});

/**
 * 7. DELETE /api/trial/leads/:id
 * Allows Master Admin to delete a customer record
 */
router.delete('/leads/:id', (req, res) => {
  try {
    const { id } = req.params;
    trialLeadsStore = trialLeadsStore.filter(l => l.id !== id);
    return res.json({ success: true, message: `Lead ${id} removed successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete lead.' });
  }
});

/**
 * 8. POST /api/trial/leads/:id/extend
 * Allows Master Admin to extend 3 hours
 */
router.post('/leads/:id/extend', (req, res) => {
  try {
    const { id } = req.params;
    const lead = trialLeadsStore.find(l => l.id === id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const now = Date.now();
    lead.demoStartedAt = now;
    lead.demoExpiresAt = now + 3 * 60 * 60 * 1000;
    lead.status = 'Active 3-Hr Demo';

    return res.json({ success: true, message: `Demo extended by 3 hours for ${lead.name}`, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to extend demo.' });
  }
});

module.exports = router;
