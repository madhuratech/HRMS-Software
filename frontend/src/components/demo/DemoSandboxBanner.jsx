import React, { useState, useEffect } from 'react';
import {
  Sparkles, Clock, RefreshCw, ChevronDown, User, ShieldCheck,
  Users, Briefcase, ArrowUpRight, LogOut, CheckCircle2, AlertTriangle, X
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

const ROLES = [
  { role: 'SUPER_ADMIN', email: 'ceo.demo@madhuratech.com', label: 'Super Admin (CEO)', icon: ShieldCheck, color: 'text-blue-400' },
  { role: 'SUPER_ADMIN', email: 'priya.hr@madhuratech.com', label: 'HR Manager', icon: Users, color: 'text-purple-400' },
  { role: 'TEAM_LEADER', email: 'vikram.lead@madhuratech.com', label: 'Team Leader', icon: Briefcase, color: 'text-amber-400' },
  { role: 'EMPLOYEE', email: 'karthik.dev@madhuratech.com', label: 'Employee Portal', icon: User, color: 'text-emerald-400' },
];

export function DemoSandboxBanner({
  currentUser,
  currentRole,
  onSwitchRole,
  onResetDatabase,
  onCutSession,
  onUpgrade
}) {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(3 * 60 * 60); // 3 Hours
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCutSession && onCutSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCutSession]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);
    try {
      await apiFetch('/demo/reset-database', { method: 'POST' }).catch(() => {});
      if (onResetDatabase) {
        await onResetDatabase();
      }
      setShowResetConfirm(false);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3500);
    } finally {
      setIsResetting(false);
    }
  };

  const currentRoleObj = ROLES.find(r => r.email === currentUser?.email) ||
    ROLES.find(r => r.role === currentRole) ||
    ROLES[0];

  return (
    <>
      <div style={{
        background: 'linear-gradient(90deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '8px 18px',
        color: '#f8fafc',
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: 'relative',
        zIndex: 100,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{
          maxWidth: '1500px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>

          {/* Left: Odoo-Style Sandbox Tag & Auto-Erase Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(96, 165, 250, 0.4)',
              borderRadius: '8px',
              padding: '4px 10px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#93c5fd', letterSpacing: '-0.2px' }}>
                Odoo Demo Sandbox
              </span>
            </div>

            {/* Auto-Erase Countdown */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '8px',
              padding: '4px 10px',
              color: '#fde68a',
              fontSize: '12px',
              fontWeight: 600
            }}>
              <Clock size={13} className="text-amber-400" />
              <span>Auto-Erase in: <strong style={{ color: '#fbbf24', fontFamily: 'monospace', fontSize: '12.5px' }}>{formatTime(timeLeftSeconds)}</strong></span>
            </div>

            {resetSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '8px',
                padding: '4px 10px',
                color: '#6ee7b7',
                fontSize: '11.5px',
                fontWeight: 600
              }}>
                <CheckCircle2 size={13} />
                <span>Demo database restored to clean default state!</span>
              </div>
            )}
          </div>

          {/* Right: Role Switcher, Reset DB, Upgrade, Exit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

            {/* 1-Click Role Switcher (Odoo-Style) */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                <currentRoleObj.icon size={13} className={currentRoleObj.color} />
                <span>Role: <strong style={{ color: '#60a5fa' }}>{currentRoleObj.label}</strong></span>
                <ChevronDown size={13} />
              </button>

              {isRoleDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '240px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    padding: '6px',
                    zIndex: 9999
                  }}
                >
                  <div style={{ padding: '6px 10px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                    Switch Demo Persona
                  </div>
                  {ROLES.map((r, i) => {
                    const isCurrent = (currentUser?.email === r.email) || (currentRole === r.role && !currentUser?.email);
                    const Icon = r.icon;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setIsRoleDropdownOpen(false);
                          onSwitchRole && onSwitchRole(r);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: isCurrent ? 'rgba(37, 99, 235, 0.3)' : 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: isCurrent ? 700 : 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          margin: '2px 0'
                        }}
                        onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                        onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Icon size={14} className={r.color} />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reset Database Button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#e2e8f0',
                borderRadius: '8px',
                padding: '5px 11px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              title="Reset sandbox data to clean demo defaults"
            >
              <RefreshCw size={12} className="text-blue-400" />
              <span>Reset Database</span>
            </button>

            {/* Upgrade Plan Button */}
            <button
              type="button"
              onClick={onUpgrade || onCutSession}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
              }}
            >
              <ArrowUpRight size={13} />
              <span>Buy License (₹59/mo)</span>
            </button>

            {/* Exit Demo Session */}
            <button
              type="button"
              onClick={onCutSession}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
              title="End demo session and return to home"
            >
              <LogOut size={12} />
              <span>Exit Demo</span>
            </button>

          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '26px',
              color: '#0f172a',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              fontFamily: "'Inter', -apple-system, sans-serif"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Reset Demo Database?
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                  Restores clean initial sample records
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              This will erase all test employees, leaves, attendance punches, or tickets created during your demo session and reload pristine sample records.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '9px 16px',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isResetting}
                onClick={handleExecuteReset}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isResetting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
