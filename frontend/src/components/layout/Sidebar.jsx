import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck,
  CalendarOff,
  DollarSign,
  UserPlus,
  ClipboardList,
  BarChart3,
  FolderKanban,
  FileBarChart,
  Receipt,
  FileText,
  LifeBuoy,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Network,
  Clock,
  Sparkles,
  Calendar
} from 'lucide-react';
import { cn, getAvatarUrl } from '../../lib/utils';
import { apiFetch } from '../../lib/api';

export function Sidebar({ userRole, onLogout }) {
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [userPermissions, setUserPermissions] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch real-time role permissions from backend
  const fetchPermissions = async () => {
    try {
      const data = await apiFetch('/rbac/user-permissions');
      if (data && data.success && data.data) {
        setUserPermissions(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch user permissions in Sidebar:', e);
    }
  };

  useEffect(() => {
    fetchPermissions();

    const handlePermUpdate = () => fetchPermissions();
    window.addEventListener('permissionsUpdated', handlePermUpdate);
    return () => window.removeEventListener('permissionsUpdated', handlePermUpdate);
  }, [userRole]);

  const getAuthUser = () => {
    try {
      const authRaw = localStorage.getItem('hrms_auth');
      if (authRaw) {
        const parsed = JSON.parse(authRaw);
        if (parsed) {
          const userObj = parsed.user || {};
          const name = parsed.name || userObj.name || localStorage.getItem('userName') || 'Admin User';
          const role = parsed.role || userObj.role || localStorage.getItem('userRole') || userRole || 'SUPER_ADMIN';
          const photo = userObj.profile_photo || userObj.avatar || null;
          
          return {
            name,
            role,
            initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            photoUrl: photo ? getAvatarUrl(photo) : null
          };
        }
      }
    } catch (e) {
      console.error('Error parsing auth user for sidebar:', e);
    }
    
    // Fallback
    const storedName = localStorage.getItem('userName') || 'Admin User';
    return {
      name: storedName,
      role: localStorage.getItem('userRole') || userRole || 'SUPER_ADMIN',
      initials: storedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      photoUrl: null
    };
  };

  const userInfo = getAuthUser();

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

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? [] : [groupId]
    );
  };

  // Dedicated menu items for EMPLOYEE role mapped to permission keys
  const employeeMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/employee/dashboard', moduleKey: 'dashboard' },
    { id: 'profile', label: 'My Profile', icon: Users, path: '/employee/profile', moduleKey: 'employees' },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck, path: '/employee/attendance', moduleKey: 'attendance' },
    { id: 'shift', label: 'My Shift', icon: Clock, path: '/employee/shift', moduleKey: 'attendance' },
    { id: 'leave', label: 'My Leave', icon: CalendarOff, path: '/employee/leave', moduleKey: 'leave' },
    { id: 'leave-types', label: 'Leave Types', icon: CalendarOff, path: '/employee/leave-types', moduleKey: 'leave' },
    { id: 'holiday-list', label: 'Holiday List', icon: Calendar, path: '/employee/holidays', moduleKey: 'leave' },
    { id: 'payroll', label: 'My Payroll', icon: DollarSign, path: '/employee/payroll', moduleKey: 'payroll' },
    { id: 'tasks', label: 'My Tasks', icon: ClipboardList, path: '/employee/tasks', moduleKey: 'projects' },
    { id: 'team', label: 'My Team', icon: Network, path: '/employee/team', moduleKey: 'employees' },
    { id: 'performance', label: 'My Performance', icon: BarChart3, path: '/employee/performance', moduleKey: 'performance' },
    { id: 'documents', label: 'My Documents', icon: FileText, path: '/employee/documents', moduleKey: 'documents' },
    { id: 'announcements', label: 'Announcements', icon: Sparkles, path: '/employee/announcements', moduleKey: 'organization' },
    { id: 'help', label: 'Help & Support', icon: LifeBuoy, path: '/employee/help', moduleKey: 'helpdesk' },
  ];

  // Dedicated menu items for TEAM_LEADER role mapped to permission keys
  const teamLeaderMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/team-leader/dashboard', moduleKey: 'dashboard' },
    { id: 'profile', label: 'My Profile', icon: Users, path: '/team-leader/profile', moduleKey: 'employees' },
    { id: 'my-attendance', label: 'My Attendance', icon: CalendarCheck, path: '/team-leader/my-attendance', moduleKey: 'attendance' },
    { id: 'my-shift', label: 'My Shift', icon: Clock, path: '/team-leader/my-shift', moduleKey: 'attendance' },
    { id: 'my-team', label: 'My Team', icon: Network, path: '/team-leader/my-team', moduleKey: 'employees' },
    { id: 'team-attendance', label: 'Team Attendance', icon: CalendarCheck, path: '/team-leader/team-attendance', moduleKey: 'attendance' },
    { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/team-leader/projects', moduleKey: 'projects' },
    { id: 'team-tasks', label: 'Team Tasks', icon: ClipboardList, path: '/team-leader/team-tasks', moduleKey: 'projects' },
    { id: 'team-performance', label: 'Team Performance', icon: BarChart3, path: '/team-leader/team-performance', moduleKey: 'performance' },
    { id: 'my-leave', label: 'My Leave', icon: CalendarOff, path: '/team-leader/my-leave', moduleKey: 'leave' },
    { id: 'team-leave', label: 'Team Leave Overview', icon: CalendarOff, path: '/team-leader/team-leave', moduleKey: 'leave' },
    { id: 'holidays', label: 'Holiday List', icon: Calendar, path: '/team-leader/holidays', moduleKey: 'leave' },
    { id: 'leave-types', label: 'Leave Types', icon: CalendarOff, path: '/team-leader/leave-types', moduleKey: 'leave' },
    { id: 'my-payroll', label: 'My Payroll', icon: DollarSign, path: '/team-leader/my-payroll', moduleKey: 'payroll' },
    { id: 'help', label: 'Help & Support', icon: LifeBuoy, path: '/team-leader/help', moduleKey: 'helpdesk' },
  ];

  // Standard Admin & HR Menu Items mapped to permission keys
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, moduleKey: 'dashboard', path: '/dashboard' },
    {
      id: 'organization',
      label: 'Organization',
      icon: Building2,
      moduleKey: 'organization',
      children: [
        { id: 'company-profile', label: 'Company Profile', path: '/company-profile', moduleKey: 'organization' },
        { id: 'departments', label: 'Departments', path: '/departments', moduleKey: 'organization' },
        { id: 'designations', label: 'Designations', path: '/designations', moduleKey: 'organization' },
        { id: 'teams', label: 'Teams', path: '/teams', moduleKey: 'organization' },
        { id: 'shift-management', label: 'Shift Management', path: '/shift-management', moduleKey: 'organization' },
        { id: 'holiday-calendar', label: 'Holiday Calendar', path: '/holiday-calendar', moduleKey: 'organization' },
        { id: 'organization-chart', label: 'Organization Chart', path: '/organization-chart', moduleKey: 'organization' }
      ]
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      moduleKey: 'employees',
      children: [
        { id: 'employee-directory', label: 'Employee Directory', path: '/employees', moduleKey: 'employees' },
        { id: 'employee-list', label: 'Employee List', path: '/employees/list', moduleKey: 'employees' },
        { id: 'add-employee', label: 'Add Employee', path: '/employees/add', moduleKey: 'employees' },
        { id: 'employee-profile', label: 'Employee Profile', path: '/employees/profile', moduleKey: 'employees' },
        { id: 'employment-history', label: 'Employment History', path: '/employees/history', moduleKey: 'employees' },
        { id: 'promotions', label: 'Promotions', path: '/employees/promotions', moduleKey: 'employees' },
        { id: 'transfers', label: 'Transfers', path: '/employees/transfers', moduleKey: 'employees' },
        { id: 'exit-management', label: 'Exit Management', path: '/employees/exit', moduleKey: 'employees' },
        { id: 'employee-documents', label: 'Employee Documents', path: '/employees/documents', moduleKey: 'employees' }
      ]
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      moduleKey: 'attendance',
      children: [
        { id: 'daily-attendance', label: 'Daily Attendance', path: '/attendance/daily', moduleKey: 'attendance' },
        { id: 'gps-attendance', label: 'GPS Attendance', path: '/attendance/gps', moduleKey: 'attendance' },
        { id: 'regularization', label: 'Regularization', path: '/attendance/regularization', moduleKey: 'attendance' },
        { id: 'shift-roster', label: 'Shift Roster', path: '/attendance/shift-roster', moduleKey: 'attendance' },
        { id: 'overtime', label: 'Overtime', path: '/attendance/overtime', moduleKey: 'attendance' },
        { id: 'late-arrival', label: 'Late Arrival', path: '/attendance/late-arrival', moduleKey: 'attendance' },
        { id: 'punch-locations', label: 'Punch Locations', path: '/attendance/punch-locations', moduleKey: 'attendance' }
      ]
    },
    {
      id: 'leave-management',
      label: 'Leave Management',
      icon: CalendarOff,
      moduleKey: 'leave',
      children: [
        { id: 'leave-dashboard', label: 'Leave Dashboard', path: '/leave-dashboard', moduleKey: 'leave' },
        { id: 'leave-applications', label: 'Leave Applications', path: '/leave-applications', moduleKey: 'leave' },
        { id: 'leave-approval', label: 'Leave Approval', path: '/leave-approval', moduleKey: 'leave' },
        { id: 'leave-balance', label: 'Leave Balance', path: '/leave-balance', moduleKey: 'leave' },
        { id: 'leave-types', label: 'Leave Types', path: '/leave-types', moduleKey: 'leave' },
        { id: 'holiday-list', label: 'Holiday List', path: '/holiday-list', moduleKey: 'leave' },
        { id: 'comp-off', label: 'Comp Off', path: '/comp-off', moduleKey: 'leave' }
      ]
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: DollarSign,
      moduleKey: 'payroll',
      children: [
        { id: 'salary-structure', label: 'Salary Structure', path: '/payroll/salary-structure', moduleKey: 'payroll' },
        { id: 'salary-components', label: 'Salary Components', path: '/payroll/components', moduleKey: 'payroll' },
        { id: 'payroll-processing', label: 'Payroll Processing', path: '/payroll/processing', moduleKey: 'payroll' },
        { id: 'generate-payslips', label: 'Generate Payslips', path: '/payroll/payslips', moduleKey: 'payroll' },
        { id: 'bonus-incentives', label: 'Bonus & Incentives', path: '/payroll/bonus', moduleKey: 'payroll' },
        { id: 'reimbursements', label: 'Reimbursements', path: '/payroll/reimbursements', moduleKey: 'payroll' },
        { id: 'loans-advances', label: 'Loans & Advances', path: '/payroll/loans', moduleKey: 'payroll' },
        { id: 'tax-management', label: 'Tax Management', path: '/payroll/tax', moduleKey: 'payroll' }
      ]
    },
    {
      id: 'recruitment',
      label: 'Recruitment',
      icon: UserPlus,
      moduleKey: 'recruitment',
      children: [
        { id: 'recruitment-dashboard', label: 'Dashboard', path: '/recruitment/dashboard', moduleKey: 'recruitment' },
        { id: 'job-openings', label: 'Job Openings', path: '/recruitment/jobs', moduleKey: 'recruitment' },
        { id: 'candidates', label: 'Candidates', path: '/recruitment/candidates', moduleKey: 'recruitment' },
        { id: 'interview-schedule', label: 'Interview Schedule', path: '/recruitment/interviews', moduleKey: 'recruitment' },
        { id: 'offer-letters', label: 'Offer Letters', path: '/recruitment/offers', moduleKey: 'recruitment' },
        { id: 'hiring-pipeline', label: 'Hiring Pipeline', path: '/recruitment/pipeline', moduleKey: 'recruitment' }
      ]
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: ClipboardList,
      moduleKey: 'onboarding',
      children: [
        { id: 'new-joiners', label: 'New Joiners', path: '/onboarding/new-joiners', moduleKey: 'onboarding' },
        { id: 'document-verification', label: 'Document Verification', path: '/onboarding/documents', moduleKey: 'onboarding' },
        { id: 'asset-allocation', label: 'Asset Allocation', path: '/onboarding/assets', moduleKey: 'onboarding' },
        { id: 'welcome-kit', label: 'Welcome Kit', path: '/onboarding/welcome-kit', moduleKey: 'onboarding' },
        { id: 'orientation', label: 'Orientation', path: '/onboarding/orientation', moduleKey: 'onboarding' },
        { id: 'probation', label: 'Probation', path: '/onboarding/probation', moduleKey: 'onboarding' }
      ]
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: BarChart3,
      moduleKey: 'performance',
      children: [
        { id: 'goals', label: 'Goals', path: '/performance/goals', moduleKey: 'performance' },
        { id: 'kpi', label: 'KPI', path: '/performance/kpis', moduleKey: 'performance' },
        { id: 'kras', label: 'KRAs', path: '/performance/kras', moduleKey: 'performance' },
        { id: 'appraisals', label: 'Appraisals', path: '/performance/appraisals', moduleKey: 'performance' },
        { id: 'reviews', label: 'Reviews', path: '/performance/reviews', moduleKey: 'performance' },
        { id: 'feedback', label: 'Feedback', path: '/performance/feedback', moduleKey: 'performance' },
        { id: 'promotions-performance', label: 'Promotions', path: '/performance/promotions', moduleKey: 'performance' }
      ]
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      moduleKey: 'projects',
      children: [
        { id: 'project-dashboard', label: 'Project Dashboard', path: '/projects/dashboard', moduleKey: 'projects' },
        { id: 'projects-list', label: 'Projects', path: '/projects/list', moduleKey: 'projects' },
        { id: 'tasks', label: 'Tasks', path: '/projects/tasks', moduleKey: 'projects' },
        { id: 'sprint-board', label: 'Sprint Board', path: '/projects/sprint-board', moduleKey: 'projects' },
        { id: 'timesheets', label: 'Timesheets', path: '/projects/timesheets', moduleKey: 'projects' },
        { id: 'milestones', label: 'Milestones', path: '/projects/milestones', moduleKey: 'projects' },
        { id: 'team-members', label: 'Team Members', path: '/projects/team', moduleKey: 'projects' }
      ]
    },
    { id: 'reports', label: 'Reports', icon: FileBarChart, moduleKey: 'reports', path: '/reports' },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: Receipt,
      moduleKey: 'expenses',
      children: [
        { id: 'expense-claims', label: 'Expense Claims', path: '/expenses/claims', moduleKey: 'expenses' },
        { id: 'expense-categories', label: 'Expense Categories', path: '/expenses/categories', moduleKey: 'expenses' },
        { id: 'expense-approval', label: 'Expense Approval', path: '/expenses/approval', moduleKey: 'expenses' },
        { id: 'expense-reimbursements', label: 'Reimbursements', path: '/expenses/reimbursements', moduleKey: 'expenses' },
        { id: 'expense-reports', label: 'Expense Reports', path: '/expenses/reports', moduleKey: 'expenses' }
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      moduleKey: 'documents',
      children: [
        { id: 'employee-documents-module', label: 'Employee Documents', path: '/documents/employee', moduleKey: 'documents' },
        { id: 'company-documents', label: 'Company Documents', path: '/documents/company', moduleKey: 'documents' },
        { id: 'hr-policies', label: 'HR Policies', path: '/documents/policies', moduleKey: 'documents' },
        { id: 'templates', label: 'Templates', path: '/documents/templates', moduleKey: 'documents' },
        { id: 'digital-signatures', label: 'Digital Signatures', path: '/documents/signatures', moduleKey: 'documents' }
      ]
    },
    {
      id: 'help-desk',
      label: 'Help Desk',
      icon: LifeBuoy,
      moduleKey: 'helpdesk',
      children: [
        { id: 'help-desk-dashboard', label: 'Dashboard', path: '/help-desk/dashboard', moduleKey: 'helpdesk' },
        { id: 'tickets', label: 'Tickets', path: '/help-desk/tickets', moduleKey: 'helpdesk' },
        { id: 'categories', label: 'Categories', path: '/help-desk/categories', moduleKey: 'helpdesk' },
        { id: 'priorities', label: 'Priorities', path: '/help-desk/priorities', moduleKey: 'helpdesk' },
        { id: 'help-desk-reports', label: 'Reports', path: '/help-desk/reports', moduleKey: 'helpdesk' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      moduleKey: 'settings',
      children: [
        { id: 'settings-company', label: 'Company Information', path: '/settings/company', moduleKey: 'settings' },
        { id: 'settings-branding', label: 'Branding', path: '/settings/branding', moduleKey: 'settings' },
        { id: 'settings-organization', label: 'Organization', path: '/settings/organization', moduleKey: 'settings' },
        { id: 'settings-users', label: 'User Roles & Permissions', path: '/settings/users', moduleKey: 'user_roles' },
        { id: 'settings-hr', label: 'HR Settings', path: '/settings/hr', moduleKey: 'settings' },
        { id: 'settings-communication', label: 'Communication', path: '/settings/communication', moduleKey: 'settings' },
        { id: 'settings-integrations', label: 'Integrations', path: '/settings/integrations', moduleKey: 'settings' },
        { id: 'settings-security', label: 'Security', path: '/settings/security', moduleKey: 'settings' },
        { id: 'settings-system', label: 'System', path: '/settings/system', moduleKey: 'settings' }
      ]
    },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, moduleKey: 'ai_assistant', path: '/ai-assistant' },
  ];

  // Helper to check if a module is permitted for current role
  const isModulePermitted = (mKey) => {
    if (userRole === 'SUPER_ADMIN' || userRole === 'Super Admin') return true;
    if (!userPermissions) return true; // Default view while loading
    const perm = userPermissions[mKey];
    if (!perm) return true; // Default allow if not configured
    return perm.view !== false;
  };

  const targetMenu = userRole === 'EMPLOYEE' ? employeeMenuItems : userRole === 'TEAM_LEADER' ? teamLeaderMenuItems : menuItems;

  // Filter top-level items and children dynamically based on RBAC database permissions
  const filteredMenu = targetMenu
    .filter(item => isModulePermitted(item.moduleKey))
    .map(item => {
      if (item.children) {
        const validChildren = item.children.filter(child => isModulePermitted(child.moduleKey));
        return { ...item, children: validChildren };
      }
      return item;
    })
    .filter(item => !item.children || item.children.length > 0);

  // Automatically expand active module group
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingGroup = filteredMenu.find(item => {
      if (item.children) {
        return item.children.some(child => child.path && (currentPath.startsWith(child.path) || currentPath === child.path));
      }
      return false;
    });

    if (matchingGroup) {
      setExpandedGroups([matchingGroup.id]);
    }
  }, [location.pathname, userRole]);

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.includes(item.id);
    const isActive = item.path === location.pathname || (hasChildren && item.children.some(child => child.path === location.pathname));

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleGroup(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium",
              isActive ? "text-white" : "custom-sidebar-btn"
            )}
          >
            <item.icon size={18} />
            <span className="flex-1 text-left">{item.label}</span>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-0.5">
              {item.children.map(child => {
                const targetPath = child.path || `/${child.id}`;
                return (
                  <button
                    key={child.id}
                    onClick={() => navigate(targetPath)}
                    className={cn(
                      "w-full flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-colors text-sm",
                      location.pathname === targetPath
                        ? "custom-sidebar-btn-active bg-blue-600 text-white"
                        : "custom-sidebar-btn"
                    )}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    const isAIAssistant = item.id === 'ai-assistant';

    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path || `/${item.id}`)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium",
          isActive
            ? (isAIAssistant ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "custom-sidebar-btn-active bg-blue-600 text-white")
            : "custom-sidebar-btn"
        )}
      >
        <item.icon
          size={18}
          className={cn(isAIAssistant ? "animate-pulse" : "")}
          style={isAIAssistant ? {
            stroke: 'url(#ai-spark-gradient)',
            filter: 'drop-shadow(0 0 18px rgba(139, 92, 246, 0.35))'
          } : {}}
        />
        {item.label}
      </button>
    );
  };

  return (
    <>
      <svg style={{ width: 0, height: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id="ai-spark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="w-64 custom-sidebar h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
        {/* Logo */}
        <div className="p-5 custom-sidebar-border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 custom-sidebar-logo-bg rounded-lg flex items-center justify-center">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">HAWKEYE NEST</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">HRMS</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredMenu.map(item => renderMenuItem(item))}
        </nav>

        {/* User Profile */}
        <div className="p-3 custom-sidebar-border-t">
          <div className="custom-sidebar-profile-bg rounded-lg p-3 flex items-center gap-3">
            <div
              onClick={handleProfileClick}
              style={{ cursor: 'pointer' }}
              className="flex flex-1 items-center gap-3 min-w-0 hover:opacity-85 transition-opacity"
            >
              {userInfo.photoUrl ? (
                <img 
                  src={userInfo.photoUrl} 
                  alt={userInfo.name} 
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full custom-sidebar-profile-avatar-bg flex items-center justify-center text-xs font-bold flex-shrink-0 text-white">
                  {userInfo.initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userInfo.name}</p>
                <p className="text-xs text-slate-400 truncate">{userInfo.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="text-slate-400 hover:text-red-400 transition-colors p-1 flex-shrink-0"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
