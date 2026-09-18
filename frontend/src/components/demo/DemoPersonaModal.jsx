import React, { useState } from 'react';
import {
  ShieldCheck, Users, Briefcase, User, Sparkles, ArrowRight,
  X, CheckCircle, RefreshCw, Database, Clock, Lock
} from 'lucide-react';

const PERSONAS = [
  {
    role: 'SUPER_ADMIN',
    personaEmail: 'ceo.demo@madhuratech.com',
    title: 'Super Admin (CEO / Org Owner)',
    badge: 'Full Super Admin Access',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    icon: ShieldCheck,
    iconBg: 'bg-blue-50 text-blue-600',
    desc: 'Unrestricted master access: All 18 modules, payroll salary runs, custom user roles, settings & executive HR analytics.',
    highlights: ['18 Modules Unlocked', 'Payroll & TDS', 'Role Matrix Config', 'Company Master Settings']
  },
  {
    role: 'SUPER_ADMIN',
    personaEmail: 'priya.hr@madhuratech.com',
    title: 'HR Operations Head',
    badge: 'HR Manager Persona',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    icon: Users,
    iconBg: 'bg-purple-50 text-purple-600',
    desc: 'Recruitment pipelines, candidate onboarding, employee documentation, leave policy approvals, and shift rosters.',
    highlights: ['Job Board & Candidates', 'Onboarding Verification', 'Leave Approvals', 'Employee Directory']
  },
  {
    role: 'TEAM_LEADER',
    personaEmail: 'vikram.lead@madhuratech.com',
    title: 'Team Leader / Project Lead',
    badge: 'Team Manager Persona',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    icon: Briefcase,
    iconBg: 'bg-amber-50 text-amber-600',
    desc: 'Manage squad projects, sprint tasks, approve team attendance regularizations, and conduct goal reviews.',
    highlights: ['Sprint Tasks Board', 'Team Attendance Approval', 'Performance KRAs', 'Timesheets']
  },
  {
    role: 'EMPLOYEE',
    personaEmail: 'karthik.dev@madhuratech.com',
    title: 'Employee Self-Service',
    badge: 'Employee Portal',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: User,
    iconBg: 'bg-emerald-50 text-emerald-600',
    desc: 'Daily GPS attendance punch, leave requests, monthly payslip download, reimbursement claims, and helpdesk tickets.',
    highlights: ['GPS Punch In/Out', 'Apply Leave', 'Download Payslips', 'Expense Reimbursements']
  }
];

export function DemoPersonaModal({ isOpen, onClose, onLaunchDemo }) {
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLaunch = async (persona) => {
    setLoading(true);
    try {
      if (onLaunchDemo) {
        await onLaunchDemo(persona || selectedPersona);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Inter', -apple-system, sans-serif"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          maxWidth: '860px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
          padding: '32px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '100px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Sparkles size={13} /> Odoo-Style Live Cloud Sandbox
              </span>
              <span style={{
                background: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '100px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Clock size={13} /> 3-Hour Auto-Erase Timer
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              Choose a Live Demo Persona
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
              Launch straight into an interactive sandbox environment. Switch roles anytime or reset data in 1 click.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Personas Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {PERSONAS.map((persona, idx) => {
            const isSelected = selectedPersona.personaEmail === persona.personaEmail;
            const Icon = persona.icon;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPersona(persona)}
                style={{
                  border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                  background: isSelected ? '#f8faff' : '#ffffff',
                  borderRadius: '16px',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isSelected ? '0 4px 16px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${persona.iconBg}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {persona.title}
                        </h4>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border inline-block mt-1 ${persona.badgeColor}`}>
                          {persona.badge}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #2563eb' : '2px solid #cbd5e1',
                      background: '#ffffff'
                    }} />
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.45, margin: '0 0 12px' }}>
                    {persona.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  {persona.highlights.map((h, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#334155',
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12.5px' }}>
            <Database size={15} color="#2563eb" />
            <span>Sandboxed instance auto-erases after 3 hours. Data can be reset anytime.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleLaunch(selectedPersona)}
              style={{
                background: '#2563eb',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>Provisioning Sandbox...</>
              ) : (
                <>Launch Live Demo as {selectedPersona.title.split(' ')[0]} <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
