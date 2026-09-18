import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export function MasterAdminLogin({ onLoginSuccess, onHomeClick }) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin@123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    setTimeout(() => {
      if (cleanEmail === 'admin@gmail.com' && cleanPass === 'admin@123') {
        const masterAdminPayload = {
          id: 1,
          name: 'Master Admin',
          email: 'admin@gmail.com',
          role: 'MASTER_ADMIN',
          company: 'Madhura Technologies',
          token: 'master_admin_jwt_token_' + Date.now()
        };
        onLoginSuccess(masterAdminPayload);
      } else {
        setErrorMsg('Invalid Master Admin credentials.');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
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
          maxWidth: '420px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 20px 40px -15px rgba(15, 23, 42, 0.05)',
          border: '1px solid #e2e8f0',
          padding: '36px 32px',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1px solid #dbeafe'
            }}
          >
            <ShieldCheck size={26} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Master Admin
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Sign in to access your master portal
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              marginBottom: '18px',
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '12.5px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '9px 12px',
                transition: 'border-color 0.15s'
              }}
            >
              <Mail size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '13.5px',
                  color: '#0f172a',
                  fontWeight: 500
                }}
                placeholder="admin@gmail.com"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '9px 12px',
                transition: 'border-color 0.15s'
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
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '13.5px',
                  color: '#0f172a',
                  fontWeight: 500
                }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px',
              width: '100%',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13.5px',
              padding: '11px 20px',
              borderRadius: '10px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            {loading ? 'Signing in...' : <>Sign In <ArrowRight size={15} /></>}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={onHomeClick}
            style={{
              color: '#64748b',
              fontSize: '12.5px',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            ← Back to Website
          </button>
        </div>
      </div>
    </div>
  );
}
