import React, { useState } from 'react';
import {
  Building2, Users, Compass, Globe, Sparkles,
  ArrowRight, ShieldCheck, CheckCircle2, MapPin, X
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { start3HourDemoSession } from '../../lib/demoDummyStore';

export function CustomerActivationModal({
  isOpen,
  customerData,
  onComplete,
  onClose
}) {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('IT & Software');
  const [employeeSize, setEmployeeSize] = useState('21-100');
  const [heardAbout, setHeardAbout] = useState('Google Search');
  const [city, setCity] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState(['All-in-One HRMS', 'Payroll & Tax']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !customerData) return null;

  const customerName = customerData.name || 'Customer Admin';
  const customerEmail = customerData.email || '';
  const customerPhone = customerData.phone || '';

  const priorityOptions = [
    'All-in-One HRMS',
    'GPS & Biometric Attendance',
    'Payroll & Tax Deductions',
    'Leave & Holidays',
    'Recruitment & Onboarding',
    'Performance & Appraisals'
  ];

  const togglePriority = (p) => {
    if (selectedPriorities.includes(p)) {
      setSelectedPriorities(selectedPriorities.filter(x => x !== p));
    } else {
      setSelectedPriorities([...selectedPriorities, p]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Please enter your company or organization name.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Submit onboarding info to backend
      const res = await apiFetch('/trial/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify({
          email: customerEmail,
          password: customerData?.password || '',
          company: companyName.trim(),
          industry,
          employeeSize,
          heardAbout,
          city: city.trim(),
          priorities: selectedPriorities
        })
      });

      // 2. Initialize isolated 3-Hour Demo Dummy Database Storage
      const demoMeta = start3HourDemoSession({
        customerName,
        company: companyName.trim(),
        email: customerEmail,
        phone: customerPhone,
        industry,
        employeeSize,
        heardAbout
      });

      // 3. Update master admin submissions in localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('hrms_trial_submissions') || '[]');
        const priorLead = existing.find(l => l.email.toLowerCase() === customerEmail.toLowerCase());
        const leadPassword = customerData?.password || (priorLead && priorLead.password) || '';

        const updatedLead = {
          id: (res && res.lead && res.lead.id) || ('TRL-' + Math.floor(10000 + Math.random() * 90000)),
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          password: leadPassword,
          company: companyName.trim(),
          industry,
          employeeSize,
          heardAbout,
          city: city.trim(),
          status: 'Active 3-Hr Demo',
          otpVerified: true,
          registeredAt: (priorLead && priorLead.registeredAt) || new Date().toISOString(),
          demoStartedAt: demoMeta.startedAt,
          demoExpiresAt: demoMeta.expiresAt,
          role: 'SUPER_ADMIN'
        };

        const filtered = existing.filter(l => l.email.toLowerCase() !== customerEmail.toLowerCase());
        localStorage.setItem('hrms_trial_submissions', JSON.stringify([updatedLead, ...filtered]));
      } catch (err) {}

      // 4. Trigger parent completion
      if (onComplete) {
        onComplete({
          ...customerData,
          company: companyName.trim(),
          industry,
          employeeSize,
          heardAbout,
          role: 'SUPER_ADMIN',
          demoMeta
        });
      }
    } catch (err) {
      console.error('Onboarding completion error:', err);
      // Even if network fails, allow local demo start
      const fallbackMeta = start3HourDemoSession({
        customerName,
        company: companyName.trim(),
        email: customerEmail,
        phone: customerPhone,
        industry,
        employeeSize,
        heardAbout
      });

      try {
        const existing = JSON.parse(localStorage.getItem('hrms_trial_submissions') || '[]');
        const priorLead = existing.find(l => l.email.toLowerCase() === customerEmail.toLowerCase());
        const leadPassword = customerData?.password || (priorLead && priorLead.password) || '';

        const updatedLead = {
          id: 'TRL-' + Math.floor(10000 + Math.random() * 90000),
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          password: leadPassword,
          company: companyName.trim(),
          industry,
          employeeSize,
          heardAbout,
          city: city.trim(),
          status: 'Active 3-Hr Demo',
          otpVerified: true,
          registeredAt: (priorLead && priorLead.registeredAt) || new Date().toISOString(),
          demoStartedAt: fallbackMeta.startedAt,
          demoExpiresAt: fallbackMeta.expiresAt,
          role: 'SUPER_ADMIN'
        };

        const filtered = existing.filter(l => l.email.toLowerCase() !== customerEmail.toLowerCase());
        localStorage.setItem('hrms_trial_submissions', JSON.stringify([updatedLead, ...filtered]));
      } catch (err2) {}

      if (onComplete) {
        onComplete({
          ...customerData,
          company: companyName.trim(),
          industry,
          employeeSize,
          heardAbout,
          role: 'SUPER_ADMIN',
          demoMeta: fallbackMeta
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.82)',
        backdropFilter: 'blur(14px)',
        zIndex: 10005,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          position: 'relative',
          maxHeight: '94vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%)",
          padding: "28px 28px 22px", borderRadius: "20px 20px 0 0", color: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              background: "rgba(255,255,255,0.18)", display: "flex",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.8 }}>
                  Super Admin Activation
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle2 size={10} /> Email Verified
                </span>
              </div>
              <h2 style={{ fontSize: "19px", fontWeight: 800, margin: "2px 0 0", letterSpacing: "-0.3px" }}>
                Welcome, {customerName}!
              </h2>
            </div>
          </div>
          <p style={{ fontSize: "13px", opacity: 0.85, margin: 0, lineHeight: 1.5 }}>
            Configure your organization profile to instantly launch your fully-featured 3-Hour Demo Workspace.
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: "26px" }}>
          {error && (
            <div
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "10px", padding: "10px 12px", marginBottom: "18px",
                fontSize: "13px", color: "#b91c1c",
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. Company Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Company / Organization Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9ca3af' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Innovations Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: "#111827",
                    transition: "border 0.2s"
                  }}
                  onFocus={(e) => e.target.style.border = '1.5px solid #3b82f6'}
                  onBlur={(e) => e.target.style.border = companyName ? '1.5px solid #10b981' : '1.5px solid #e2e8f0'}
                />
              </div>
            </div>

            {/* 2. Industry & City */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Industry / Org Type <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13.5px',
                      outline: 'none',
                      background: '#f8fafc',
                      boxSizing: 'border-box',
                      color: "#111827",
                      appearance: "none",
                      WebkitAppearance: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="IT & Software">IT & Software</option>
                    <option value="Manufacturing & Production">Manufacturing & Production</option>
                    <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                    <option value="Finance & Banking">Finance & Banking</option>
                    <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                    <option value="Education & EdTech">Education & EdTech</option>
                    <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                    <option value="Construction & Real Estate">Construction & Real Estate</option>
                    <option value="Consulting & Agency">Consulting & Agency</option>
                    <option value="Other Industry">Other Industry</option>
                  </select>
                  <div style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none', color: '#64748b' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Headquarters City
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: "#111827",
                    }}
                    onFocus={(e) => e.target.style.border = '1.5px solid #3b82f6'}
                    onBlur={(e) => e.target.style.border = '1.5px solid #e2e8f0'}
                  />
                </div>
              </div>
            </div>

            {/* 3. Employee Size */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Current Workforce / Employee Size <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {['1-10', '11-50', '51-200', '201-500', '500+'].map((sz) => (
                  <button
                    type="button"
                    key={sz}
                    onClick={() => setEmployeeSize(sz)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: `1.5px solid ${employeeSize === sz ? '#3b82f6' : '#e2e8f0'}`,
                      background: employeeSize === sz ? '#eff6ff' : '#f8fafc',
                      color: employeeSize === sz ? '#1d4ed8' : '#475569',
                      fontSize: '11.5px',
                      fontWeight: employeeSize === sz ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: "all 0.2s"
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Where did you hear about us? */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Where did you hear about Madhura HRMS? <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Compass size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9ca3af' }} />
                <select
                  value={heardAbout}
                  onChange={(e) => setHeardAbout(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box',
                    color: "#111827",
                    appearance: "none",
                    WebkitAppearance: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="Google Search">Google Search</option>
                  <option value="LinkedIn / Social Media">LinkedIn / Social Media</option>
                  <option value="Colleague / Friend Referral">Colleague / Friend Referral</option>
                  <option value="Tech Event / HR Conference">Tech Event / HR Conference</option>
                  <option value="YouTube / Video Demo">YouTube / Video Demo</option>
                  <option value="Online Advertisement">Online Advertisement</option>
                  <option value="Other Source">Other Source</option>
                </select>
                <div style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none', color: '#64748b' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* 5. Primary HR Interests / Goals */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Modules You Want to Explore (Optional)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {priorityOptions.map((opt) => {
                  const active = selectedPriorities.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => togglePriority(opt)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: `1.5px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
                        background: active ? '#eff6ff' : '#f8fafc',
                        color: active ? '#1d4ed8' : '#64748b',
                        fontSize: '11.5px',
                        fontWeight: active ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: "all 0.2s"
                      }}
                    >
                      {active && <CheckCircle2 size={12} />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sandbox & Production Safe Notice */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginTop: '4px'
              }}
            >
              <ShieldCheck size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '1px' }} />
              <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.4 }}>
                <strong>Isolated 3-Hour Demo Environment:</strong> Your actions here do not affect real data. The workspace will safely self-destruct after 3 hours.
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting || !companyName.trim()}
              style={{
                marginTop: '4px',
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: companyName.trim()
                  ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                  : '#e2e8f0',
                color: companyName.trim() ? '#ffffff' : '#94a3b8',
                border: 'none',
                fontSize: '15px',
                fontWeight: 700,
                cursor: companyName.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: companyName.trim() ? '0 10px 15px -3px rgba(37, 99, 235, 0.3)' : 'none',
                transition: "all 0.2s"
              }}
            >
              {isSubmitting ? (
                'Initializing Demo Workspace...'
              ) : (
                <>
                  <Sparkles size={16} /> Launch My 3-Hour Super Admin Demo <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
