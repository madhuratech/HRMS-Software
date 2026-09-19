const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const db = require('../config/database');

// Active OTP cache: email -> { otp, expiresAt, sessionId }
const activeOtps = new Map();

// In-memory fallback store
let trialLeadsStore = [];

/**
 * Initialize MySQL trial_leads table for permanent data storage
 */
const initTrialLeadsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS trial_leads (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(100),
      password VARCHAR(255),
      company VARCHAR(255),
      industry VARCHAR(255),
      employee_size VARCHAR(100),
      heard_about VARCHAR(255),
      city VARCHAR(255),
      status VARCHAR(100) DEFAULT 'Pending Activation',
      activation_token VARCHAR(255),
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      demo_started_at BIGINT NULL,
      demo_expires_at BIGINT NULL,
      role VARCHAR(50) DEFAULT 'SUPER_ADMIN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("Error creating trial_leads table:", err.message);
  });
};

initTrialLeadsTable();

/**
 * 0. GET /api/trial/test-smtp & /api/trial/test-email
 * Diagnostic endpoint to test Resend API connectivity and status
 */
const testEmailHandler = async (req, res) => {
  try {
    const testResult = await emailService.verifyConnection();
    return res.json({
      success: testResult.success,
      config: {
        provider: 'Resend API',
        hasApiKey: !!(process.env.RESEND_API_KEY),
        fromEmail: process.env.RESEND_FROM_EMAIL || 'Madhura HRMS <onboarding@resend.dev>'
      },
      result: testResult
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
router.get('/test-smtp', testEmailHandler);
router.get('/test-email', testEmailHandler);

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

    // Try sending email via Resend API
    let emailSent = false;
    let emailErrorMessage = null;
    try {
      if (process.env.RESEND_API_KEY) {
        await emailService.sendOtpEmail({
          toEmail: cleanEmail,
          recipientName: cleanName,
          otpCode
        });
        emailSent = true;
      } else {
        console.warn('[Trial OTP Email Notice] RESEND_API_KEY not configured.');
      }
    } catch (e) {
      emailErrorMessage = e.message;
      console.warn('[Trial OTP Email Notice] Resend delivery skipped or error:', e.message);
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ success: false, message: `Failed to dispatch verification email via Resend: ${e.message}` });
      }
    }

    return res.json({
      success: true,
      message: emailSent
        ? `Verification code dispatched to ${cleanEmail}. Valid for 10 minutes.`
        : `Verification code generated. (Resend API key missing or unverified recipient notice: ${emailErrorMessage || 'Not configured'})`,
      sessionId,
      email: cleanEmail,
      emailSent,
      // Provide dev preview OTP only if Resend fails or is not configured
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
 * Helper to save/update lead in MySQL database
 */
const saveLeadToDb = (lead) => {
  const sql = `
    INSERT INTO trial_leads (id, name, email, phone, password, company, industry, employee_size, heard_about, city, status, activation_token, demo_started_at, demo_expires_at, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      phone = VALUES(phone),
      password = COALESCE(NULLIF(VALUES(password), ''), password),
      company = COALESCE(NULLIF(VALUES(company), ''), company),
      industry = COALESCE(NULLIF(VALUES(industry), ''), industry),
      employee_size = COALESCE(NULLIF(VALUES(employee_size), ''), employee_size),
      heard_about = COALESCE(NULLIF(VALUES(heard_about), ''), heard_about),
      city = COALESCE(NULLIF(VALUES(city), ''), city),
      status = VALUES(status),
      activation_token = VALUES(activation_token),
      demo_started_at = VALUES(demo_started_at),
      demo_expires_at = VALUES(demo_expires_at),
      updated_at = NOW()
  `;
  db.query(sql, [
    lead.id,
    lead.name,
    lead.email,
    lead.phone || '',
    lead.password || '',
    lead.company || '',
    lead.industry || '',
    lead.employeeSize || lead.headcount || '',
    lead.heardAbout || '',
    lead.city || '',
    lead.status || 'Pending Activation',
    lead.activationToken || '',
    lead.demoStartedAt || null,
    lead.demoExpiresAt || null,
    lead.role || 'SUPER_ADMIN'
  ], (err) => {
    if (err) console.error('[DB SAVE LEAD ERROR]:', err.message);
  });
};

/**
 * Helper to fetch leads from MySQL database
 */
const getLeadsFromDb = () => {
  return new Promise((resolve) => {
    db.query("SELECT * FROM trial_leads ORDER BY created_at DESC", (err, rows) => {
      if (err || !rows) {
        return resolve(trialLeadsStore);
      }
      const mapped = rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        password: r.password,
        company: r.company,
        industry: r.industry,
        employeeSize: r.employee_size,
        heardAbout: r.heard_about,
        city: r.city,
        status: r.status,
        activationToken: r.activation_token,
        registeredAt: r.registered_at || r.created_at,
        demoStartedAt: r.demo_started_at ? Number(r.demo_started_at) : null,
        demoExpiresAt: r.demo_expires_at ? Number(r.demo_expires_at) : null,
        role: r.role || 'SUPER_ADMIN'
      }));
      resolve(mapped);
    });
  });
};

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

    const existingLeads = await getLeadsFromDb();
    const existingIndex = existingLeads.findIndex(l => l.email.toLowerCase() === cleanEmail);
    const id = 'TRL-' + Math.floor(10000 + Math.random() * 90000);
    const activationToken = crypto.randomBytes ? crypto.randomBytes(24).toString('hex') : 'act_' + Date.now();

    const newLead = {
      id: existingIndex >= 0 ? existingLeads[existingIndex].id : id,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: password.trim(),
      company: existingIndex >= 0 ? existingLeads[existingIndex].company : '',
      industry: existingIndex >= 0 ? existingLeads[existingIndex].industry : '',
      employeeSize: existingIndex >= 0 ? existingLeads[existingIndex].employeeSize : '',
      heardAbout: existingIndex >= 0 ? existingLeads[existingIndex].heardAbout : '',
      city: existingIndex >= 0 ? existingLeads[existingIndex].city : '',
      status: 'Pending Activation',
      otpVerified: true,
      activationToken,
      registeredAt: new Date().toISOString(),
      demoStartedAt: null,
      demoExpiresAt: null,
      role: 'SUPER_ADMIN'
    };

    // Save to Database
    saveLeadToDb(newLead);

    // Keep in-memory store updated
    if (existingIndex >= 0) {
      trialLeadsStore[existingIndex] = { ...trialLeadsStore[existingIndex], ...newLead };
    } else {
      trialLeadsStore.unshift(newLead);
    }

    const origin = req.headers.origin || 'http://localhost:5173';
    const activationUrl = `${origin}/activate-trial?token=${activationToken}&email=${encodeURIComponent(cleanEmail)}`;

    console.log(`[TRIAL REGISTRATION] Customer: ${cleanName} (${cleanEmail}) - Activation URL: ${activationUrl}`);

    // Dispatch the activation email via Resend API
    let emailSent = false;
    try {
      if (process.env.RESEND_API_KEY) {
        await emailService.sendActivationEmail({
          toEmail: cleanEmail,
          recipientName: cleanName,
          activationUrl
        });
        emailSent = true;
      }
    } catch (e) {
      console.warn('[Trial Activation Email Notice] Resend delivery failed:', e.message);
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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email/Username and password are required.' });
    }

    const cleanInput = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const leads = await getLeadsFromDb();
    const lead = leads.find(l => 
      (l.email.toLowerCase() === cleanInput || l.name.toLowerCase() === cleanInput) &&
      (l.password === cleanPass)
    );

    if (!lead) {
      return res.status(401).json({ success: false, message: 'Invalid trial credentials.' });
    }

    const now = Date.now();
    if (lead.demoExpiresAt && now >= lead.demoExpiresAt) {
      lead.status = 'Demo Expired';
      saveLeadToDb(lead);
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
router.all('/activate', async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    const email = (req.query.email || req.body.email || '').trim().toLowerCase();

    const leads = await getLeadsFromDb();
    let lead = leads.find(l => l.activationToken === token);
    if (!lead && email) {
      lead = leads.find(l => l.email.toLowerCase() === email);
    }

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Invalid or expired activation link.' });
    }

    // Mark as Activated if still pending
    if (lead.status === 'Pending Activation') {
      lead.status = 'Activated';
      saveLeadToDb(lead);
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
router.post('/complete-onboarding', async (req, res) => {
  try {
    const { email, password, company, industry, employeeSize, heardAbout, city, priorities } = req.body;

    if (!company) {
      return res.status(400).json({ success: false, message: 'Company or organization name is required.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const leads = await getLeadsFromDb();
    let lead = leads.find(l => l.email.toLowerCase() === cleanEmail);

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
    }

    // Save lead details to MySQL Database
    saveLeadToDb(lead);

    return res.json({
      success: true,
      message: 'Company onboarding completed. 3-Hour Demo session initialized with isolated database storage.',
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
 * Returns all customer trial leads from MySQL Database for Master Admin Dashboard
 */
router.get('/leads', async (req, res) => {
  try {
    const leads = await getLeadsFromDb();
    const now = Date.now();
    
    // Check demo expiry state
    leads.forEach(lead => {
      if (lead.status === 'Active 3-Hr Demo' && lead.demoExpiresAt && now > lead.demoExpiresAt) {
        lead.status = 'Demo Expired';
        saveLeadToDb(lead);
      }
    });

    return res.json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (err) {
    console.error('Get trial leads error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch trial leads.' });
  }
});

/**
 * 7. DELETE /api/trial/leads/:id
 * Allows Master Admin to delete a customer record from MySQL Database
 */
router.delete('/leads/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.query("DELETE FROM trial_leads WHERE id = ?", [id], (err) => {
      if (err) console.error('[DELETE TRIAL LEAD ERROR]:', err);
    });
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
router.post('/leads/:id/extend', async (req, res) => {
  try {
    const { id } = req.params;
    const leads = await getLeadsFromDb();
    const lead = leads.find(l => l.id === id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const now = Date.now();
    lead.demoStartedAt = now;
    lead.demoExpiresAt = now + 3 * 60 * 60 * 1000;
    lead.status = 'Active 3-Hr Demo';

    saveLeadToDb(lead);

    return res.json({ success: true, message: `Demo extended by 3 hours for ${lead.name}`, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to extend demo.' });
  }
});

module.exports = router;
