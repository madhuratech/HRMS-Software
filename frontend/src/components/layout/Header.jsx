import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Search, ChevronRight, X, Calendar, CheckSquare, Folder,
  Settings, FileText, HelpCircle,
  CheckCircle2, XCircle, User, Clock, Wallet, AlignJustify
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

export function Header({ title, userRole, currentView }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const authRaw = localStorage.getItem('hrms_auth');
  let authData = {};
  try { if (authRaw) authData = JSON.parse(authRaw); } catch (e) { }

  const handleProfileClick = () => {
    let userId = 1;
    const auth = localStorage.getItem('hrms_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.user && parsed.user.id) userId = parsed.user.id;
      } catch (e) { }
    }
    localStorage.setItem('selectedEmployeeId', userId);
    navigate('/employees/profile');
  };

  const fetchNotifications = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const res = await apiFetch('/notifications');
      if (res && res.success) {
        const notifList = Array.isArray(res.notifications) ? res.notifications : (Array.isArray(res.data) ? res.data : []);
        setNotifications(notifList);
        const count = typeof res.unreadCount === 'number' ? res.unreadCount : notifList.filter(n => !n.is_read && !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (e) {
      // Gracefully maintain current state on network hiccups
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    const handleOnline = () => fetchNotifications();
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleOnline);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleOnline);
    };
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead && !notif.is_read) {
        await apiFetch(`/notifications/${notif.id}/read`, { method: 'PUT' });
      }
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setShowNotifications(false);
      if (notif.actionUrl || notif.action_url) {
        navigate(notif.actionUrl || notif.action_url);
      }
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all notifications read:', e);
    }
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const now = new Date();
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Just now';
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  // Returns rowBg (full row tint), iconBg, and icon element per notification type
  const getItemTheme = (type) => {
    const t = (type || '').toUpperCase();

    if (t.includes('LEAVE_APPROVED') || t.includes('LEAVE_APPROVAL')) {
      return {
        rowBg: '#F3FDF6',
        iconBg: '#D1FAE5',
        icon: <CheckCircle2 size={22} style={{ color: '#16A34A' }} />,
      };
    }
    if (t.includes('LEAVE_REJECTED') || t.includes('LEAVE_REJECTION')) {
      return {
        rowBg: '#FFF5F5',
        iconBg: '#FEE2E2',
        icon: <XCircle size={22} style={{ color: '#DC2626' }} />,
      };
    }
    if (t.includes('LEAVE')) {
      return {
        rowBg: '#F0F4FF',
        iconBg: '#DBEAFE',
        icon: <Calendar size={22} style={{ color: '#1D61E7' }} />,
      };
    }
    if (t.includes('PAYROLL') || t.includes('PAYSLIP')) {
      return {
        rowBg: '#F3FDF6',
        iconBg: '#D1FAE5',
        icon: <Wallet size={22} style={{ color: '#16A34A' }} />,
      };
    }
    if (t.includes('ATTENDANCE')) {
      return {
        rowBg: '#F3FDF6',
        iconBg: '#D1FAE5',
        icon: <Clock size={22} style={{ color: '#16A34A' }} />,
      };
    }
    if (t.includes('PERMISSION') || t.includes('ROLE')) {
      return {
        rowBg: '#F8F4FF',
        iconBg: '#EDE9FE',
        icon: <Settings size={22} style={{ color: '#7C3AED' }} />,
      };
    }
    if (t.includes('DOCUMENT')) {
      return {
        rowBg: '#F0F4FF',
        iconBg: '#DBEAFE',
        icon: <FileText size={22} style={{ color: '#1D61E7' }} />,
      };
    }
    if (t.includes('TASK')) {
      return {
        rowBg: '#F0F4FF',
        iconBg: '#DBEAFE',
        icon: <CheckSquare size={22} style={{ color: '#1D61E7' }} />,
      };
    }
    if (t.includes('PROJECT')) {
      return {
        rowBg: '#F8F4FF',
        iconBg: '#EDE9FE',
        icon: <Folder size={22} style={{ color: '#7C3AED' }} />,
      };
    }
    if (t.includes('TICKET') || t.includes('HELPDESK')) {
      return {
        rowBg: '#FFF5F5',
        iconBg: '#FEE2E2',
        icon: <HelpCircle size={22} style={{ color: '#DC2626' }} />,
      };
    }
    if (t.includes('EMPLOYEE') || t.includes('PROFILE')) {
      return {
        rowBg: '#F0F4FF',
        iconBg: '#DBEAFE',
        icon: <User size={22} style={{ color: '#1D61E7' }} />,
      };
    }
    // default
    return {
      rowBg: '#F0F4FF',
      iconBg: '#DBEAFE',
      icon: <Bell size={22} style={{ color: '#1D61E7' }} />,
    };
  };

  const getBreadcrumbs = () => {
    const viewMap = {
      // Main & Common
      'dashboard': ['Dashboard'],
      'ai-assistant': ['AI Assistant'],
      'notifications': ['Notifications'],

      // Organization
      'company-profile': ['Organization', 'Company Profile'],
      'branches': ['Organization', 'Branches'],
      'departments': ['Organization', 'Departments'],
      'designations': ['Organization', 'Designations'],
      'teams': ['Organization', 'Teams'],
      'work-locations': ['Organization', 'Work Locations'],
      'shift-management': ['Organization', 'Shift Management'],
      'holiday-calendar': ['Organization', 'Holiday Calendar'],
      'organization-chart': ['Organization', 'Organization Chart'],
      'user-roles': ['Organization', 'User Roles'],

      // Employees (Admin/HR)
      'employees': ['Employees', 'Employee Directory'],
      'employees-dashboard': ['Employees', 'Employee Directory'],
      'employees-list': ['Employees', 'Employee List'],
      'employees-add': ['Employees', 'Add Employee'],
      'employees-profile': ['Employees', 'Employee Profile'],
      'employees-history': ['Employees', 'Employment History'],
      'employees-promotions': ['Employees', 'Promotions'],
      'employees-transfers': ['Employees', 'Transfers'],
      'employees-exit': ['Employees', 'Exit Management'],
      'employees-documents': ['Employees', 'Employee Documents'],
      'employees-reports': ['Employees', 'Employee Reports'],

      // Employee Self-Service Portal
      'employee': ['Employee Portal', 'Dashboard'],
      'employee-dashboard': ['Employee Portal', 'Dashboard'],
      'employee-profile': ['Employee Portal', 'My Profile'],
      'employee-attendance': ['Employee Portal', 'My Attendance'],
      'employee-shift': ['Employee Portal', 'My Shift'],
      'employee-leave': ['Employee Portal', 'Leave Applications'],
      'employee-leave-balance': ['Employee Portal', 'Leave Balance'],
      'employee-leave-requests': ['Employee Portal', 'Leave Requests'],
      'employee-leave-types': ['Employee Portal', 'Leave Types'],
      'employee-holidays': ['Employee Portal', 'Holidays'],
      'employee-payroll': ['Employee Portal', 'My Payroll'],
      'employee-tasks': ['Employee Portal', 'My Tasks'],
      'employee-team': ['Employee Portal', 'My Team'],
      'employee-performance': ['Employee Portal', 'My Performance'],
      'employee-documents': ['Employee Portal', 'My Documents'],
      'employee-announcements': ['Employee Portal', 'Announcements'],
      'employee-help': ['Employee Portal', 'Help Desk'],

      // Team Leader Portal
      'team-leader': ['Team Leader Portal', 'Dashboard'],
      'team-leader-dashboard': ['Team Leader Portal', 'Dashboard'],
      'team-leader-profile': ['Team Leader Portal', 'My Profile'],
      'team-leader-my-attendance': ['Team Leader Portal', 'My Attendance'],
      'team-leader-my-shift': ['Team Leader Portal', 'My Shift'],
      'team-leader-my-team': ['Team Leader Portal', 'My Team'],
      'team-leader-team-attendance': ['Team Leader Portal', 'Team Attendance'],
      'team-leader-projects': ['Team Leader Portal', 'Projects'],
      'team-leader-team-tasks': ['Team Leader Portal', 'Team Tasks'],
      'team-leader-team-performance': ['Team Leader Portal', 'Team Performance'],
      'team-leader-my-leave': ['Team Leader Portal', 'My Leave'],
      'team-leader-team-leave': ['Team Leader Portal', 'Team Leave Approval'],
      'team-leader-holidays': ['Team Leader Portal', 'Holidays'],
      'team-leader-leave-types': ['Team Leader Portal', 'Leave Types'],
      'team-leader-my-payroll': ['Team Leader Portal', 'My Payroll'],
      'team-leader-help': ['Team Leader Portal', 'Help Desk'],

      // Attendance
      'attendance': ['Attendance', 'Daily Attendance'],
      'attendance-daily': ['Attendance', 'Daily Attendance'],
      'attendance-gps': ['Attendance', 'GPS & Geofencing'],
      'attendance-gps-punch': ['Attendance', 'GPS Attendance Punch'],
      'attendance-punch': ['Attendance', 'GPS Attendance Punch'],
      'attendance-punch-locations': ['Attendance', 'Punch Locations'],
      'attendance-biometric': ['Attendance', 'Biometric Attendance'],
      'attendance-regularization': ['Attendance', 'Regularization'],
      'attendance-shift-roster': ['Attendance', 'Shift Roster'],
      'attendance-overtime': ['Attendance', 'Overtime'],
      'attendance-late-arrival': ['Attendance', 'Late Arrival'],
      'attendance-reports': ['Attendance', 'Attendance Reports'],

      // Leave Management
      'leave-management': ['Leave Management', 'Leave Dashboard'],
      'leave-dashboard': ['Leave Management', 'Leave Dashboard'],
      'leave-applications': ['Leave Management', 'Leave Applications'],
      'leave-approval': ['Leave Management', 'Leave Approval'],
      'leave-balance': ['Leave Management', 'Leave Balance'],
      'leave-types': ['Leave Management', 'Leave Types'],
      'leave-reports': ['Leave Management', 'Leave Reports'],
      'holiday-list': ['Leave Management', 'Holiday List'],
      'comp-off': ['Leave Management', 'Comp Off'],

      // Payroll
      'payroll': ['Payroll', 'Salary Structure'],
      'payroll-salary-structure': ['Payroll', 'Salary Structure'],
      'payroll-components': ['Payroll', 'Salary Components'],
      'payroll-processing': ['Payroll', 'Payroll Processing'],
      'payroll-payslips': ['Payroll', 'Generate Payslips'],
      'payroll-bonus': ['Payroll', 'Bonus & Incentives'],
      'payroll-reimbursements': ['Payroll', 'Reimbursements'],
      'payroll-loans': ['Payroll', 'Loans & Advances'],
      'payroll-tax': ['Payroll', 'Tax Management'],
      'payroll-reports': ['Payroll', 'Payroll Reports'],

      // Recruitment
      'recruitment': ['Recruitment', 'Recruitment Dashboard'],
      'recruitment-dashboard': ['Recruitment', 'Recruitment Dashboard'],
      'recruitment-jobs': ['Recruitment', 'Job Openings'],
      'recruitment-candidates': ['Recruitment', 'Candidates'],
      'recruitment-screening': ['Recruitment', 'Candidate Screening'],
      'recruitment-interviews': ['Recruitment', 'Interview Schedule'],
      'recruitment-offers': ['Recruitment', 'Offer Letters'],
      'recruitment-pipeline': ['Recruitment', 'Hiring Pipeline'],
      'recruitment-reports': ['Recruitment', 'Recruitment Reports'],

      // Onboarding
      'onboarding': ['Onboarding', 'New Joiners'],
      'onboarding-new-joiners': ['Onboarding', 'New Joiners'],
      'onboarding-documents': ['Onboarding', 'Document Verification'],
      'onboarding-assets': ['Onboarding', 'Asset Allocation'],
      'onboarding-welcome-kit': ['Onboarding', 'Welcome Kit'],
      'onboarding-orientation': ['Onboarding', 'Orientation'],
      'onboarding-probation': ['Onboarding', 'Probation'],

      // Performance
      'performance': ['Performance', 'Goals'],
      'performance-goals': ['Performance', 'Goals'],
      'performance-kpis': ['Performance', 'KPIs'],
      'performance-kras': ['Performance', 'KRAs'],
      'performance-appraisals': ['Performance', 'Appraisals'],
      'performance-reviews': ['Performance', 'Reviews'],
      'performance-feedback': ['Performance', 'Feedback'],
      'performance-promotions': ['Performance', 'Promotions'],
      'performance-reports': ['Performance', 'Performance Reports'],

      // Projects
      'projects': ['Projects', 'Project Dashboard'],
      'projects-dashboard': ['Projects', 'Project Dashboard'],
      'projects-list': ['Projects', 'Projects List'],
      'projects-tasks': ['Projects', 'Tasks'],
      'projects-sprint-board': ['Projects', 'Sprint Board'],
      'projects-timesheets': ['Projects', 'Timesheets'],
      'projects-milestones': ['Projects', 'Milestones'],
      'projects-team': ['Projects', 'Team Members'],
      'projects-reports': ['Projects', 'Project Reports'],

      // Clients
      'clients': ['Clients', 'All Clients'],
      'clients-list': ['Clients', 'All Clients'],
      'clients-add': ['Clients', 'Add Client'],

      // Expenses
      'expenses': ['Expenses', 'Expense Claims'],
      'expenses-claims': ['Expenses', 'Expense Claims'],
      'expenses-categories': ['Expenses', 'Expense Categories'],
      'expenses-approval': ['Expenses', 'Expense Approval'],
      'expenses-reimbursements': ['Expenses', 'Reimbursements'],
      'expenses-reports': ['Expenses', 'Expense Reports'],

      // Documents
      'documents': ['Documents', 'Employee Documents'],
      'documents-employee': ['Documents', 'Employee Documents'],
      'documents-company': ['Documents', 'Company Documents'],
      'documents-policies': ['Documents', 'HR Policies'],
      'documents-templates': ['Documents', 'Templates'],
      'documents-signatures': ['Documents', 'Digital Signatures'],

      // Help Desk
      'help-desk': ['Help Desk', 'Help Desk Dashboard'],
      'help-desk-dashboard': ['Help Desk', 'Help Desk Dashboard'],
      'help-desk-tickets': ['Help Desk', 'Tickets'],
      'help-desk-categories': ['Help Desk', 'Categories'],
      'help-desk-priorities': ['Help Desk', 'Priorities'],
      'help-desk-knowledge-base': ['Help Desk', 'Knowledge Base'],
      'help-desk-reports': ['Help Desk', 'Help Desk Reports'],

      // Settings
      'settings': ['Settings', 'Company Settings'],
      'settings-company': ['Settings', 'Company Settings'],
      'settings-branding': ['Settings', 'Branding'],
      'settings-organization': ['Settings', 'Organization'],
      'settings-users': ['Settings', 'User Roles & Permissions'],
      'settings-hr': ['Settings', 'HR Settings'],
      'settings-communication': ['Settings', 'Communication'],
      'settings-integrations': ['Settings', 'Integrations'],
      'settings-security': ['Settings', 'Security'],
      'settings-system': ['Settings', 'System Settings'],

      // Reports
      'reports': ['Reports', 'Reports Directory'],
      'reports-employees': ['Reports', 'Employee Reports'],
      'reports-employee': ['Reports', 'Employee Reports'],
      'reports-attendance': ['Reports', 'Attendance Reports'],
      'reports-leave': ['Reports', 'Leave Reports'],
      'reports-payroll': ['Reports', 'Payroll Reports'],
      'reports-recruitment': ['Reports', 'Recruitment Reports'],
      'reports-performance': ['Reports', 'Performance Reports'],
      'reports-projects': ['Reports', 'Project Reports'],
      'reports-project': ['Reports', 'Project Reports'],
      'reports-expenses': ['Reports', 'Expense Reports'],

      // Sales, Support & Service
      'sales': ['Sales', 'Sales Entry'],
      'leads': ['Sales', 'Sales Enquiries'],
      'customer-sales': ['Sales', 'Customer Sales Details'],
      'service': ['Service', 'Task Board'],
      'news': ['Communication', 'News Feed'],
      'schedule': ['HR', 'Shift Scheduler'],
      'support': ['Support', 'Support Tickets'],
      'assets': ['Assets', 'Asset Allocation'],
    };

    if (viewMap[currentView]) {
      return viewMap[currentView];
    }

    // Dynamic matching for client paths
    if (currentView?.startsWith('clients-')) {
      if (currentView.endsWith('-edit')) return ['Clients', 'Edit Client'];
      return ['Clients', 'Client Details'];
    }

    // Smart fallback formatting: turn 'recruitment-dashboard' -> ['Recruitment', 'Dashboard']
    if (currentView && typeof currentView === 'string') {
      const parts = currentView.split('-').filter(Boolean);
      if (parts.length > 0) {
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
      }
    }

    return [title || 'Dashboard'];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="header h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} className="text-slate-400" />}
              <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-slate-800' : 'text-slate-500'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Search, Notifications, User */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: unreadCount > 9 ? 18 : 18,
                  height: 18,
                  width: unreadCount > 9 ? 'auto' : 18,
                  padding: unreadCount > 9 ? '0 5px' : 0,
                  background: '#EF4444',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* ══════════════════════════════════════════════
              NOTIFICATION DROPDOWN — reference image match
          ══════════════════════════════════════════════ */}
          {showNotifications && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setShowNotifications(false)}
              />

              {/* Card */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 520,
                  maxWidth: 'calc(100vw - 2rem)',
                  background: '#FFFFFF',
                  borderRadius: 24,
                  boxShadow: '0 20px 60px rgba(15,23,42,0.13)',
                  border: '1px solid #E8EDF5',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'min(580px, 85vh)',
                  overflow: 'hidden',
                }}
              >

                {/* ── HEADER (fixed) ── */}
                <div
                  style={{
                    flexShrink: 0,
                    padding: '20px 24px 16px 24px',
                    borderBottom: '1px solid #F0F4FA',
                    background: '#FFFFFF',
                  }}
                >
                  {/* Row 1: title + badge  |  mark-all-read + divider + X */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    {/* Left */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px', lineHeight: 1 }}>
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            background: '#EBF3FF',
                            color: '#1A73E8',
                            border: '1px solid #C5DAFC',
                            borderRadius: 100,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 10px',
                            lineHeight: '18px',
                          }}
                        >
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {/* Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            fontSize: 13, fontWeight: 600, color: '#1A73E8',
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 0, lineHeight: 1,
                          }}
                        >
                          <CheckCircle2 size={15} style={{ color: '#1A73E8' }} />
                          Mark all read
                        </button>
                      )}
                      {unreadCount > 0 && (
                        <span style={{ width: 1, height: 18, background: '#CBD5E1', display: 'inline-block', margin: '0 2px' }} />
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28, borderRadius: 8,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#94A3B8',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8'; }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: subtitle */}
                  <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: 400 }}>
                    Recent activity and updates
                  </p>
                </div>

                {/* ── NOTIFICATION LIST (scrollable) ── */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E1 transparent',
                  }}
                >
                  {notifications.length === 0 ? (
                    /* ── Empty state ── */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '52px 24px', textAlign: 'center' }}>
                      <div
                        style={{
                          width: 56, height: 56, borderRadius: 16,
                          background: '#F8FAFF', border: '1px solid #E2E8F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: 14,
                        }}
                      >
                        <Bell size={24} style={{ color: '#CBD5E1' }} />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#475569', margin: 0 }}>No new notifications</p>
                      <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>You're all caught up.</p>
                    </div>
                  ) : (
                    /* ── Notification rows ── */
                    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {notifications.map((n) => {
                        const isUnread = !n.isRead && !n.is_read;
                        const theme = getItemTheme(n.type);
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 14,
                              padding: '14px 16px',
                              borderRadius: 16,
                              background: theme.rowBg,
                              cursor: 'pointer',
                              transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                          >
                            {/* ── Icon box ── */}
                            <div
                              style={{
                                width: 48, height: 48, minWidth: 48,
                                borderRadius: 13,
                                background: theme.iconBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {theme.icon}
                            </div>

                            {/* ── Text ── */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* Title row */}
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                <span
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: '#0F172A',
                                    lineHeight: '1.35',
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  {n.title}
                                </span>
                                {/* Time + unread dot */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, paddingTop: 1 }}>
                                  <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                    {getRelativeTime(n.createdAt || n.created_at)}
                                  </span>
                                  {isUnread && (
                                    <span
                                      style={{
                                        width: 9, height: 9,
                                        borderRadius: '50%',
                                        background: '#2563EB',
                                        display: 'inline-block',
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Description */}
                              <p
                                style={{
                                  fontSize: 13,
                                  color: '#64748B',
                                  lineHeight: '1.5',
                                  marginTop: 3,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {n.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── FOOTER (fixed) ── */}
                <div
                  style={{
                    flexShrink: 0,
                    borderTop: '1px solid #F0F4FA',
                    background: '#FFFFFF',
                  }}
                >
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/notifications');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '18px 24px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#1A73E8',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F0F7FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <AlignJustify size={16} style={{ color: '#1A73E8' }} />
                    <span>View All Notifications</span>
                    <ChevronRight size={16} style={{ color: '#1A73E8' }} />
                  </button>
                </div>

              </div>
              {/* end card */}
            </>
          )}
          {/* end showNotifications */}
        </div>
        {/* end notification bell wrapper */}

        {/* User Info */}
        <div
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {((authData.name || localStorage.getItem('userName')) || 'User').split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{(authData.name || localStorage.getItem('userName')) || 'User'}</p>
            <p className="text-xs font-medium text-slate-500">
              {authData.user?.emp_id || authData.user?.employeeCode || (authData.user?.employee_id ? `EMP${String(authData.user.employee_id).padStart(4, '0')}` : '')}
              {(authData.user?.emp_id || authData.user?.employeeCode || authData.user?.employee_id) ? ' • ' : ''}
              {authData.user?.designation || (userRole ? userRole.replace(/_/g, ' ') : (authData.role ? authData.role.replace(/_/g, ' ') : 'User'))}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
