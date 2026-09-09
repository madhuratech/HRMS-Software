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
    try {
      const res = await apiFetch('/notifications');
      if (res && res.success) {
        const notifList = Array.isArray(res.notifications) ? res.notifications : (Array.isArray(res.data) ? res.data : []);
        setNotifications(notifList);
        const count = typeof res.unreadCount === 'number' ? res.unreadCount : notifList.filter(n => !n.is_read && !n.isRead).length;
        setUnreadCount(count);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (e) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
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
      'dashboard': ['Dashboard'],
      'company-profile': ['Organization', 'Company Profile'],
      'branches': ['Organization', 'Branches'],
      'departments': ['Organization', 'Departments'],
      'designations': ['Organization', 'Designations'],
      'teams': ['Organization', 'Teams'],
      'work-locations': ['Organization', 'Work Locations'],
      'shift-management': ['Organization', 'Shift Management'],
      'holiday-calendar': ['Organization', 'Holiday Calendar'],
      'organization-chart': ['Organization', 'Organization Chart'],
      'employees': ['Employees', 'Employee Directory'],
      'employees-list': ['Employees', 'Employee List'],
      'employees-add': ['Employees', 'Add Employee'],
      'employees-profile': ['Employees', 'Employee Profile'],
      'employees-history': ['Employees', 'Employment History'],
      'employees-promotions': ['Employees', 'Promotions'],
      'employees-transfers': ['Employees', 'Transfers'],
      'employees-exit': ['Employees', 'Exit Management'],
      'employees-documents': ['Employees', 'Employee Documents'],
      'attendance': ['Attendance'],
      'attendance-daily': ['Attendance', 'Daily Attendance'],
      'attendance-gps': ['Attendance', 'GPS Attendance Punch'],
      'attendance-gps-punch': ['Attendance', 'GPS Attendance Punch'],
      'attendance-biometric': ['Attendance', 'Biometric Attendance'],
      'attendance-regularization': ['Attendance', 'Regularization'],
      'attendance-shift-roster': ['Attendance', 'Shift Roster'],
      'attendance-overtime': ['Attendance', 'Overtime'],
      'attendance-late-arrival': ['Attendance', 'Late Arrival'],
      'attendance-reports': ['Attendance', 'Attendance Reports'],
      'leave-management': ['Leave Management'],
      'leave-dashboard': ['Leave Management', 'Leave Dashboard'],
      'leave-applications': ['Leave Management', 'Leave Applications'],
      'leave-approval': ['Leave Management', 'Leave Approval'],
      'leave-balance': ['Leave Management', 'Leave Balance'],
      'leave-types': ['Leave Management', 'Leave Types'],
      'holiday-list': ['Leave Management', 'Holiday List'],
      'comp-off': ['Leave Management', 'Comp Off'],
      'payroll': ['Payroll'],
      'recruitment': ['Recruitment'],
      'onboarding': ['Onboarding'],
      'performance': ['Performance'],
      'training': ['Training'],
      'projects': ['Projects'],
      'reports': ['Reports'],
      'reports-employees': ['Reports', 'Employee Reports'],
      'reports-employee': ['Reports', 'Employee Reports'],
      'reports-attendance': ['Reports', 'Attendance Reports'],
      'reports-leave': ['Reports', 'Leave Reports'],
      'reports-payroll': ['Reports', 'Payroll Reports'],
      'reports-recruitment': ['Reports', 'Recruitment Reports'],
      'reports-performance': ['Reports', 'Performance Reports'],
      'reports-projects': ['Reports', 'Project Reports'],
      'reports-project': ['Reports', 'Project Reports'],
      'assets': ['Assets'],
      'expenses': ['Expenses'],
      'documents': ['Documents'],
      'help-desk': ['Help Desk'],
      'settings': ['Settings'],
    };
    return viewMap[currentView] || [title];
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
