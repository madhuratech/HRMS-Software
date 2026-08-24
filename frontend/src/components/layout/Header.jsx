import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronRight, X, Sparkles, Folder, Calendar, FileText, CheckSquare, Settings } from 'lucide-react';
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
      if (res && res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.is_read).length);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await apiFetch(`/notifications/${notif.id}/read`, { method: 'PUT' });
      }
      fetchNotifications();
      setShowNotifications(false);
      if (notif.action_url) {
        navigate(notif.action_url);
      }
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/notifications/mark-all-read', { method: 'POST' });
      fetchNotifications();
    } catch (e) {
      console.error('Failed to mark all notifications read:', e);
    }
  };

  const getRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  const getNotificationIcon = (type) => {
    const t = (type || '').toUpperCase();
    if (t.includes('LEAVE')) return <Calendar size={16} className="text-amber-500" />;
    if (t.includes('TASK')) return <CheckSquare size={16} className="text-blue-500" />;
    if (t.includes('PROJECT')) return <Folder size={16} className="text-indigo-500" />;
    if (t.includes('PERMISSION') || t.includes('ROLE')) return <Settings size={16} className="text-purple-500" />;
    return <FileText size={16} className="text-slate-500" />;
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
      'user-roles': ['Settings', 'User Roles & Permissions']
    };
    return viewMap[currentView] || [title];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={14} className="text-slate-400" />}
            <span className={index === breadcrumbs.length - 1 ? "font-semibold text-slate-800" : "text-slate-500"}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
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

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-20 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">Notifications</h3>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 ${!notif.is_read ? 'bg-blue-50/40' : ''}`}
                      >
                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className={`text-sm font-semibold truncate ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {getRelativeTime(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="mt-2.5 w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      <Bell size={32} className="mx-auto mb-2 opacity-20 text-slate-400" />
                      No new notifications
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                    className="text-blue-600 text-xs font-bold hover:underline"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* User Info */}
        <div
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
          className="flex items-center gap-3 pl-1 hover:opacity-85 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {((authData.name || localStorage.getItem('userName')) || 'Dhilipan P').split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{(authData.name || localStorage.getItem('userName')) || 'Dhilipan P'}</p>
            <p className="text-xs font-medium text-slate-500">{userRole === 'EMPLOYEE' ? 'EMP0015' : userRole === 'TEAM_LEADER' ? 'EMP0010 • Team Leader' : (localStorage.getItem('userRole') || 'Super Admin')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
