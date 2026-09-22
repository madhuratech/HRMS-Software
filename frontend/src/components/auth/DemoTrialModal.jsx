import React, { useState } from 'react';
import { Sparkles, Building2, Mail, Phone, Lock, ArrowRight, CheckCircle2, X, User, KeyRound } from 'lucide-react';

export function DemoTrialModal({ isOpen, onClose, onStartTrial, onOpenLogin, onOpenDemoPersona }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('demo@123');
  const [headcount, setHeadcount] = useState('21-100');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTrialSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !companyName.trim() || !phone.trim() || !password.trim()) {
      return;
    }
    setLoading(true);

    const newLead = {
      id: 'TRL-' + Date.now().toString().slice(-5),
      name: fullName.trim(),
      company: companyName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      headcount: headcount,
      role: 'SUPER_ADMIN',
      status: 'Active 3-Day Trial',
      submittedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      daysTotal: 3,
      daysRemaining: 3
    };

    try {
      const existing = JSON.parse(localStorage.getItem('hrms_trial_submissions') || '[]');
      const updated = [newLead, ...existing.filter(item => item.email !== newLead.email)];
      localStorage.setItem('hrms_trial_submissions', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving trial submission:', err);
    }

    setTimeout(() => {
      onStartTrial({
        name: fullName.trim(),
        company: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
        headcount: headcount,
        role: 'SUPER_ADMIN',
        daysTotal: 3,
        daysRemaining: 3,
        startedAt: Date.now()
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <style>{`
        .demo-modal-no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .demo-modal-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div
        className="demo-modal-no-scrollbar"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '580px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          border: '1px solid #e2e8f0',
          padding: '32px',
          position: 'relative',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #dbeafe'
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: '#2563eb',
                  display: 'block'
                }}
              >
                Instant 3-Day Access
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                Start Free Trial Workspace
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Benefits Pill */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            <CheckCircle2 size={15} color="#10b981" />
            <span>All 18 Modules Unlocked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            <CheckCircle2 size={15} color="#10b981" />
            <span>Instant Super Admin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            <CheckCircle2 size={15} color="#10b981" />
            <span>3 Days Free</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleTrialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Your Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '9px 12px'
                }}
              >
                <User size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Work Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '9px 12px'
                }}
              >
                <Mail size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Company Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '9px 12px'
                }}
              >
                <Building2 size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Acme Technologies"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '9px 12px'
                }}
              >
                <Phone size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Create Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '9px 12px'
                }}
              >
                <Lock size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input
                  type="password"
                  placeholder="Set Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Headcount Tier
              </label>
              <select
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '9px 10px',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="1-20">1 - 20 Users (Starter)</option>
                <option value="21-100">21 - 100 Users (Pro)</option>
                <option value="101-300">101 - 300 Users (Business)</option>
                <option value="300+">300+ Users (Enterprise)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '12px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Opening Your Free Trial Workspace...' : 'Launch 3-Day Free Trial Workspace'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Odoo Demo Shortcut */}
        {onOpenDemoPersona && (
          <div style={{ marginTop: '16px', textAlign: 'center', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDemoPersona();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>⚡ Or explore Odoo-Style Live Sandbox (Instant 1-Click) →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
