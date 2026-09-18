import React, { useState, useEffect } from 'react';
import {
  Sparkles, X, ChevronRight, ChevronLeft, Check,
  LayoutDashboard, Users, Clock, CreditCard, Calendar,
  Briefcase, Building2, ShieldCheck, Compass
} from 'lucide-react';

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Super Admin Command Center',
    badge: 'Dashboard & Intelligence',
    icon: LayoutDashboard,
    color: '#2563eb',
    description: 'Welcome to your Super Admin Dashboard! Here you have 360-degree visibility over live workforce headcount, present employees, pending leave requests, and department metrics.',
    highlight: 'Real-time analytics and quick action shortcuts allow you to oversee your entire organization at a single glance.'
  },
  {
    step: 2,
    title: 'Complete Employee Lifecycle',
    badge: 'Staff & Profiles',
    icon: Users,
    color: '#059669',
    description: 'Manage every employee from hiring to offboarding. Click "+ Add Employee" anytime to test adding dummy staff, assigning departments, managing promotions, and storing employment documents.',
    highlight: 'All employee additions during your 3-hour demo are safely saved in your isolated dummy storage.'
  },
  {
    step: 3,
    title: 'Attendance & GPS Biometrics',
    badge: 'Time & Attendance',
    icon: Clock,
    color: '#d97706',
    description: 'Explore multi-mode attendance tracking: Geofenced GPS punch, biometric device sync, shift rosters, overtime calculations, and manager regularization approvals.',
    highlight: 'Try simulating a daily clock-in punch to see live presence update in real-time!'
  },
  {
    step: 4,
    title: 'Automated Payroll Engine',
    badge: 'Compensation & TDS',
    icon: CreditCard,
    color: '#db2777',
    description: 'Generate accurate salary payslips in 1-click with automated gross-to-net calculations, PF/ESI statutory compliance, income tax TDS brackets, and reimbursements.',
    highlight: 'Includes one-click batch payslip generation and encrypted employee salary slips.'
  },
  {
    step: 5,
    title: 'Leave & Holiday Management',
    badge: 'Leave Balances',
    icon: Calendar,
    color: '#7c3aed',
    description: 'Configure custom leave types (Casual, Sick, Earned, Comp-Off), define multi-level approval hierarchies, and sync with the company-wide holiday calendar.',
    highlight: 'Managers can approve or reject leave requests with a single click.'
  },
  {
    step: 6,
    title: 'Recruitment & Job Openings',
    badge: 'Hiring Pipeline',
    icon: Briefcase,
    color: '#0891b2',
    description: 'Post open vacancies directly to your public career page, track candidate applications across interview stages, and generate digital offer letters.',
    highlight: 'Built-in applicant screening pipeline ensures effortless hiring.'
  },
  {
    step: 7,
    title: 'Organization & Role Permissions',
    badge: 'Settings & Security',
    icon: Building2,
    color: '#4f46e5',
    description: 'Customize company departments, designation tiers, shift schedules, and granular role-based permissions (Super Admin, HR Manager, Team Leader, Employee).',
    highlight: 'Your 3-Hour Demo Workspace is now ready! Click below to start freely exploring.'
  }
];

export function DemoTutorialTour({ isOpen, onClose, onNavigateTab }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const current = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;
  const StepIcon = current.icon;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)',
          border: '1px solid #e2e8f0',
          padding: '32px',
          position: 'relative',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        {/* Top Header Bar with Step Badge & Skip Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                background: '#eff6ff',
                color: '#2563eb',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid #dbeafe'
              }}
            >
              Step {current.step} of {TOUR_STEPS.length}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: current.color,
                background: `${current.color}15`,
                padding: '4px 10px',
                borderRadius: '20px'
              }}
            >
              {current.badge}
            </span>
          </div>

          {/* CRITICAL: Skip Tour Button */}
          <button
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span>Skip Tour</span>
            <X size={14} />
          </button>
        </div>

        {/* Step Visual & Content */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', marginBottom: '22px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${current.color}, ${current.color}dd)`,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 8px 16px ${current.color}40`
            }}
          >
            <StepIcon size={28} />
          </div>

          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              {current.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              {current.description}
            </p>
          </div>
        </div>

        {/* Highlight Card */}
        <div
          style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '26px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Sparkles size={18} style={{ color: current.color, flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#334155', margin: 0, fontWeight: 500 }}>
            {current.highlight}
          </p>
        </div>

        {/* Footer: Stepper Dots & Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Stepper Dots */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                aria-label={`Go to step ${s.step}`}
                style={{
                  width: idx === currentStepIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentStepIndex ? current.color : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {!isFirst && (
              <button
                onClick={handlePrev}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                background: isLast ? '#059669' : '#2563eb',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isLast
                  ? '0 4px 12px rgba(5, 150, 105, 0.3)'
                  : '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              {isLast ? (
                <>
                  <Check size={16} /> Got it! Start Exploring
                </>
              ) : (
                <>
                  Next Step <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
