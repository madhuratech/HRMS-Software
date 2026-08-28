import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronRight, X, Menu } from 'lucide-react';
import { LeaveApprovals } from '../attendance/LeaveApprovals';

export function Header({ title, userRole, currentView, onMenuToggle }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const isManager = userRole === 'BRANCH_MANAGER' || userRole === 'SUPER_ADMIN';

  const authRaw = localStorage.getItem('hrms_auth');
  let authData = {};
  try { if (authRaw) authData = JSON.parse(authRaw); } catch(e) {}

  const handleProfileClick = () => {
    let userId = 1;
    const auth = localStorage.getItem('hrms_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.user && parsed.user.id) userId = parsed.user.id;
      } catch (e) {}
    }
    localStorage.setItem('selectedEmployeeId', userId);
    navigate('/employees/profile');
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
    };
    return viewMap[currentView] || [title];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 text-sm hidden sm:flex">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} className="text-slate-400" />}
              <span className={index === breadcrumbs.length - 1 ? "font-semibold text-slate-800" : "text-slate-500"}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Search, Notifications, User */}
      <div className="flex items-center gap-5">
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
            {isManager && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                3
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
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {isManager ? (
                    <div className="p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-3">Leave Requests</p>
                      <LeaveApprovals compact limit={3} />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      <Bell size={32} className="mx-auto mb-2 opacity-20" />
                      No new notifications
                    </div>
                  )}
                </div>
                
                {isManager && (
                  <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                    <button className="text-blue-600 text-xs font-bold hover:underline">
                      View All Notifications
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Info */}
        <div 
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
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
