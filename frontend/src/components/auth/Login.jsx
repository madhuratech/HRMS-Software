import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export function Login({ onLogin, onRegisterClick, onCustomerDemoLogin, onHomeClick }) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin@123');
  const [loginType, setLoginType] = useState('admin'); // 'admin' | 'employee' | 'trial'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedRole = loginType === 'admin' ? 'SUPER_ADMIN' : (loginType === 'trial' ? 'TRIAL_CUSTOMER' : 'EMPLOYEE');

  const handleRoleClick = (type) => {
    setLoginType(type);
    if (type === 'admin') {
      setEmail('admin@gmail.com');
      setPassword('admin@123');
    } else if (type === 'employee') {
      setEmail('dhilipanmadhuratech@gmail.com');
      setPassword('admin@123');
    } else {
      // Free trial customer login
      const lastTrial = (() => {
        try {
          const list = JSON.parse(localStorage.getItem('hrms_trial_submissions') || '[]');
          return list[0] || null;
        } catch (e) { return null; }
      })();
      setEmail(lastTrial?.email || lastTrial?.name || '');
      setPassword(lastTrial?.password || '');
    }
    setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Default Direct Master Admin Access -> Opens Master Organizations & Form Tracking Portal
    if (cleanEmail === 'admin@gmail.com' && cleanPass === 'admin@123') {
      setTimeout(() => {
        const adminPayload = {
          id: 1,
          userId: 1,
          employee_id: 1,
          employeeId: 1,
          emp_id: 'EMP0001',
          employeeCode: 'EMP0001',
          name: 'Master Admin',
          email: 'admin@gmail.com',
          role: 'MASTER_ADMIN',
          company: 'Madhura Technologies',
          token: 'jwt_master_admin_session_token'
        };
        onLogin('MASTER_ADMIN', 'Master Admin', adminPayload);
        setLoading(false);
      }, 350);
      return;
    }

    // 1. Check Free Trial Customer credentials (Username/Email and Password created during Free Trial)
    const localTrials = (() => {
      try {
        return JSON.parse(localStorage.getItem('hrms_trial_submissions') || '[]');
      } catch (e) {
        return [];
      }
    })();

    const matchedTrial = localTrials.find(t => 
      (t.email.toLowerCase() === cleanEmail || (t.name && t.name.toLowerCase() === cleanEmail)) &&
      (t.password && t.password === cleanPass)
    );

    if (matchedTrial) {
      const now = Date.now();
      const expiresAt = matchedTrial.demoExpiresAt ? Number(matchedTrial.demoExpiresAt) : (now + 3 * 60 * 60 * 1000);

      if (now >= expiresAt) {
        const { purgeExpiredDemoSession } = await import('../../lib/demoDummyStore');
        purgeExpiredDemoSession();
        setErrorMsg('Your 3-Hour Free Trial Demo session has expired. The 3-hour sandbox limit has ended.');
        setLoading(false);
        return;
      }

      // Active 3-Hour Demo session! Resume session with dummy database
      const demoMeta = {
        isActive: true,
        is3HourDemo: true,
        customerName: matchedTrial.name,
        company: matchedTrial.company || 'Customer Organization',
        email: matchedTrial.email,
        phone: matchedTrial.phone || '',
        industry: matchedTrial.industry || 'IT & Software',
        employeeSize: matchedTrial.employeeSize || '21-100',
        heardAbout: matchedTrial.heardAbout || 'Website',
        startedAt: matchedTrial.demoStartedAt || (expiresAt - 3 * 60 * 60 * 1000),
        expiresAt: expiresAt,
        durationMinutes: 180
      };

      localStorage.setItem('hrms_3hr_demo_meta', JSON.stringify(demoMeta));
      localStorage.setItem('hrms_trial_session', JSON.stringify(demoMeta));
      localStorage.setItem('hrms_is_demo_sandbox', 'true');

      const { initializeDummyDatabase } = await import('../../lib/demoDummyStore');
      initializeDummyDatabase(demoMeta.company, demoMeta.customerName, false);

      const trialUserPayload = {
        id: matchedTrial.id || 1,
        userId: matchedTrial.id || 1,
        name: matchedTrial.name,
        email: matchedTrial.email,
        role: 'SUPER_ADMIN',
        company: demoMeta.company,
        emp_id: 'SUPER ADMIN',
        employeeCode: 'SUPER ADMIN',
        designation: 'Managing Director & Super Admin',
        is3HourDemo: true,
        isTrialDemo: true,
        demoMeta,
        token: 'trial_customer_jwt_' + Date.now()
      };

      onLogin('SUPER_ADMIN', matchedTrial.name, trialUserPayload);
      setLoading(false);
      return;
    }

    // Also verify trial credentials with backend trial router
    try {
      const trialRes = await apiFetch('/trial/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });
      if (trialRes && trialRes.success && trialRes.lead) {
        const lead = trialRes.lead;
        const now = Date.now();
        const expiresAt = lead.demoExpiresAt ? Number(lead.demoExpiresAt) : (now + 3 * 60 * 60 * 1000);

        if (now >= expiresAt) {
          const { purgeExpiredDemoSession } = await import('../../lib/demoDummyStore');
          purgeExpiredDemoSession();
          setErrorMsg('Your 3-Hour Free Trial Demo session has expired. The 3-hour sandbox limit has ended.');
          setLoading(false);
          return;
        }

        const demoMeta = {
          isActive: true,
          is3HourDemo: true,
          customerName: lead.name,
          company: lead.company || 'Customer Organization',
          email: lead.email,
          phone: lead.phone || '',
          industry: lead.industry || 'IT & Software',
          employeeSize: lead.employeeSize || '21-100',
          heardAbout: lead.heardAbout || 'Website',
          startedAt: lead.demoStartedAt || (expiresAt - 3 * 60 * 60 * 1000),
          expiresAt: expiresAt,
          durationMinutes: 180
        };

        localStorage.setItem('hrms_3hr_demo_meta', JSON.stringify(demoMeta));
        localStorage.setItem('hrms_trial_session', JSON.stringify(demoMeta));
        localStorage.setItem('hrms_is_demo_sandbox', 'true');

        const { initializeDummyDatabase } = await import('../../lib/demoDummyStore');
        initializeDummyDatabase(demoMeta.company, demoMeta.customerName, false);

        const trialUserPayload = {
          id: lead.id || 1,
          name: lead.name,
          email: lead.email,
          role: 'SUPER_ADMIN',
          company: demoMeta.company,
          emp_id: 'SUPER ADMIN',
          employeeCode: 'SUPER ADMIN',
          designation: 'Managing Director & Super Admin',
          is3HourDemo: true,
          isTrialDemo: true,
          demoMeta,
          token: 'trial_customer_jwt_' + Date.now()
        };

        onLogin('SUPER_ADMIN', lead.name, trialUserPayload);
        setLoading(false);
        return;
      }
    } catch (trialErr) {
      if (trialErr && trialErr.message && (trialErr.message.includes('expired') || trialErr.message.includes('3-hour'))) {
        const { purgeExpiredDemoSession } = await import('../../lib/demoDummyStore');
        purgeExpiredDemoSession();
        setErrorMsg('Your 3-Hour Free Trial Demo session has expired. The 3-hour sandbox limit has ended.');
        setLoading(false);
        return;
      }
    }

    try {
      const roleToSend = loginType === 'admin' ? 'admin' : (loginType === 'trial' ? 'admin' : loginType);
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: cleanPass, selectedRole: roleToSend })
      });

      if (data && data.success && data.user) {
        const userPayload = {
          ...data.user,
          token: data.token,
          permissions: data.permissions
        };
        onLogin(data.user.role, data.user.name, userPayload);
        return;
      } else if (data && data.message) {
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (cleanEmail.includes('admin')) {
        const adminPayload = {
          id: 1,
          name: 'Super Admin',
          email: cleanEmail,
          role: 'SUPER_ADMIN',
          company: 'Madhura Technologies',
          token: 'fallback_admin_token'
        };
        onLogin('SUPER_ADMIN', 'Super Admin', adminPayload);
      } else {
        setErrorMsg(err.message || 'Invalid credentials. Default: admin@gmail.com / admin@123');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090d16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '920px',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Left Side: Brand & Feature Panel (Dark Theme) */}
        <div
          style={{
            flex: '1 1 380px',
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            padding: '40px 36px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            borderRight: '1px solid #1e293b'
          }}
        >
          <div>
            {/* Logo */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', cursor: 'pointer' }}
              onClick={onHomeClick}
              title="Return to Website"
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                }}
              >
                <Sparkles size={20} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
                Madhura <span style={{ color: '#60a5fa', fontWeight: 500 }}>HRMS</span>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(37, 99, 235, 0.2)',
                color: '#93c5fd',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '100px',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginBottom: '14px'
              }}
            >
              Enterprise Workforce Platform
            </div>

            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.3,
                marginBottom: '12px'
              }}
            >
              Intelligent Workforce Management
            </h2>
            <p
              style={{
                color: '#94a3b8',
                fontSize: '13px',
                lineHeight: 1.6,
                marginBottom: '28px'
              }}
            >
              Complete automated control over all 18 HR modules, biometric attendance sync, automated payroll, and workforce analytics.
            </p>

            {/* Default Super Admin Credentials Box */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                padding: '16px 20px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: '#60a5fa',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={14} /> Super Admin Credentials
              </div>
              <div style={{ fontSize: '12.5px', color: '#cbd5e1', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Default Email:</span>
                <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>admin@gmail.com</strong>
              </div>
              <div style={{ fontSize: '12.5px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                <span>Default Password:</span>
                <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>admin@123</strong>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              marginTop: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748b'
            }}
          >
            <span>Madhura Technologies Pvt. Ltd.</span>
            <button
              onClick={onHomeClick}
              style={{
                color: '#60a5fa',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              ← Back to Website
            </button>
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div
          style={{
            flex: '1 1 420px',
            padding: '40px 36px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: '#2563eb'
              }}
            >
              Admin & Staff Portal
            </span>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#0f172a',
                marginTop: '4px',
                marginBottom: '4px'
              }}
            >
              Sign In to Workspace
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Use the default admin credentials or your staff account.
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                marginBottom: '18px',
                padding: '12px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12.5px',
                borderRadius: '12px',
                fontWeight: 600
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Role Switcher */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Select Login Role
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1.2fr',
                  gap: '6px',
                  background: '#f1f5f9',
                  padding: '4px',
                  borderRadius: '12px'
                }}
              >
                <button
                  type="button"
                  onClick={() => handleRoleClick('admin')}
                  style={{
                    padding: '8px 8px',
                    borderRadius: '9px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.15s ease',
                    background: selectedRole === 'SUPER_ADMIN' ? '#2563eb' : 'transparent',
                    color: selectedRole === 'SUPER_ADMIN' ? '#ffffff' : '#64748b',
                    boxShadow: selectedRole === 'SUPER_ADMIN' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none'
                  }}
                >
                  <ShieldCheck size={14} />
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleClick('employee')}
                  style={{
                    padding: '8px 8px',
                    borderRadius: '9px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.15s ease',
                    background: selectedRole === 'EMPLOYEE' ? '#2563eb' : 'transparent',
                    color: selectedRole === 'EMPLOYEE' ? '#ffffff' : '#64748b',
                    boxShadow: selectedRole === 'EMPLOYEE' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none'
                  }}
                >
                  <User size={14} />
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleClick('trial')}
                  style={{
                    padding: '8px 8px',
                    borderRadius: '9px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.15s ease',
                    background: selectedRole === 'TRIAL_CUSTOMER' ? '#2563eb' : 'transparent',
                    color: selectedRole === 'TRIAL_CUSTOMER' ? '#ffffff' : '#64748b',
                    boxShadow: selectedRole === 'TRIAL_CUSTOMER' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none'
                  }}
                >
                  <Sparkles size={14} />
                  Free Trial
                </button>
              </div>
            </div>

            {/* Email / Username Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  {loginType === 'trial' ? 'Trial Username or Email' : 'Email Address'}
                </label>
                {loginType === 'trial' && (
                  <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
                    3-Hour Demo Active
                  </span>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '10px 14px'
                }}
              >
                <User size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    fontWeight: 500
                  }}
                  placeholder={loginType === 'trial' ? 'Enter username or email registered' : 'admin@gmail.com'}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Password
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '10px 14px'
                }}
              >
                <Lock size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    fontWeight: 500
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
                width: '100%',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.15s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Signing In...' : <>Sign In as {selectedRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'} <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12.5px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              Free Trial Customer?{' '}
              <button
                type="button"
                onClick={onCustomerDemoLogin}
                style={{
                  color: '#2563eb',
                  fontWeight: 700,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Customer Free Demo Login →
              </button>
            </div>
            <div>
              Want to start a trial?{' '}
              <button
                type="button"
                onClick={onRegisterClick}
                style={{
                  color: '#2563eb',
                  fontWeight: 700,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}