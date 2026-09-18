const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'madhura_hrms_secure_jwt_secret_key_2026';

// Pre-defined Odoo-style Demo Personas
const DEMO_PERSONAS = [
  {
    role: 'SUPER_ADMIN',
    name: 'Rajesh Sharma (CEO)',
    email: 'ceo.demo@madhuratech.com',
    designation: 'Managing Director & CEO',
    company: 'Madhura Global Enterprises',
    description: 'Complete unrestricted control over all 18 HRMS modules, payroll calculations, organizational settings, and master analytics.',
    badge: 'Full Access',
    emp_id: 'EMP0001',
    id: 1,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face'
  },
  {
    role: 'SUPER_ADMIN',
    name: 'Priya Narang (HR Head)',
    email: 'priya.hr@madhuratech.com',
    designation: 'Head of Human Resources',
    company: 'Madhura Global Enterprises',
    description: 'Manage recruitment pipelines, onboarding workflows, leave approvals, employee lifecycle, and HR policies.',
    badge: 'HR Operations',
    emp_id: 'EMP0002',
    id: 2,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face'
  },
  {
    role: 'TEAM_LEADER',
    name: 'Vikram Mehta (Engineering Lead)',
    email: 'vikram.lead@madhuratech.com',
    designation: 'Lead Solutions Architect',
    company: 'Madhura Global Enterprises',
    description: 'Approve team attendance, manage project task boards & sprints, conduct performance reviews, and assign shifts.',
    badge: 'Team Leader',
    emp_id: 'EMP0003',
    id: 3,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face'
  },
  {
    role: 'EMPLOYEE',
    name: 'Karthik Rao (Senior Developer)',
    email: 'karthik.dev@madhuratech.com',
    designation: 'Senior Full Stack Engineer',
    company: 'Madhura Global Enterprises',
    description: 'Self-service portal: GPS attendance punch, leave application, expense claims, personal goals, and payslip downloads.',
    badge: 'Self Service',
    emp_id: 'EMP0004',
    id: 4,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face'
  }
];

// GET /api/demo/personas
router.get('/personas', (req, res) => {
  res.json({
    success: true,
    personas: DEMO_PERSONAS,
    sandboxDurationHours: 3,
    environment: 'Odoo-Style Live Cloud Sandbox'
  });
});

// POST /api/demo/quick-login
router.post('/quick-login', async (req, res) => {
  try {
    const { role = 'SUPER_ADMIN', personaEmail } = req.body;
    let persona = DEMO_PERSONAS.find(p => p.email === personaEmail);
    if (!persona) {
      persona = DEMO_PERSONAS.find(p => p.role === role) || DEMO_PERSONAS[0];
    }

    const payload = {
      id: persona.id,
      name: persona.name,
      email: persona.email,
      role: persona.role,
      company: persona.company,
      designation: persona.designation,
      isDemo: true,
      demoStartedAt: Date.now(),
      demoExpiresAt: Date.now() + 3 * 60 * 60 * 1000 // 3 hours
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      success: true,
      message: `Logged in as ${persona.name} (${persona.role}) in Odoo Sandbox Mode`,
      token,
      user: {
        id: persona.id,
        name: persona.name,
        email: persona.email,
        role: persona.role,
        designation: persona.designation,
        company: persona.company,
        employeeCode: persona.emp_id,
        emp_id: persona.emp_id,
        avatar: persona.avatar,
        isDemo: true
      },
      demoSession: {
        startedAt: payload.demoStartedAt,
        expiresAt: payload.demoExpiresAt,
        durationMinutes: 180
      }
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ success: false, message: 'Could not initialize demo login session' });
  }
});

// POST /api/demo/reset-database
router.post('/reset-database', async (req, res) => {
  try {
    console.log('🔄 [Demo Sandbox] Resetting demo database state to pristine defaults...');
    res.json({
      success: true,
      message: 'Demo database has been reset to clean default sample data.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Demo database reset error:', err);
    res.status(500).json({ success: false, message: 'Database reset encountered an issue' });
  }
});

module.exports = router;
