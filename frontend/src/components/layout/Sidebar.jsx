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
  GraduationCap,
  FolderKanban,
  FileBarChart,
  Package,
  Receipt,
  FileText,
  LifeBuoy,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Network,
  GitBranch,
  Layers,
  Briefcase,
  MapPin,
  Clock,
  CalendarDays,
  TreePine,
  Bird
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ userRole, onLogout }) {
  const [expandedGroups, setExpandedGroups] = useState(['organization', 'employees']);
  const location = useLocation();
  const navigate = useNavigate();

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

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Automatically expand groups based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.startsWith('/employees') && !expandedGroups.includes('employees')) {
      setExpandedGroups(prev => [...prev, 'employees']);
    }
  }, [location.pathname]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ALL'], path: '/dashboard' },
    {
      id: 'organization',
      label: 'Organization',
      icon: Building2,
      roles: ['ALL'],
      children: [
        { id: 'company-profile', label: 'Company Profile', path: '/company-profile' },
        { id: 'departments', label: 'Departments', path: '/departments' },
        { id: 'designations', label: 'Designations', path: '/designations' },
        { id: 'teams', label: 'Teams', path: '/teams' },
        { id: 'shift-management', label: 'Shift Management', path: '/shift-management' },
        { id: 'holiday-calendar', label: 'Holiday Calendar', path: '/holiday-calendar' },
        { id: 'organization-chart', label: 'Organization Chart', path: '/organization-chart' }
      ]
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      roles: ['ALL'],
      children: [
        { id: 'employee-dashboard', label: 'Employee Dashboard', path: '/employees/dashboard' },
        { id: 'employee-directory', label: 'Employee Directory', path: '/employees' },
        { id: 'employee-list', label: 'Employee List', path: '/employees/list' },
        { id: 'add-employee', label: 'Add Employee', path: '/employees/add' },
        { id: 'employee-profile', label: 'Employee Profile', path: '/employees/profile' },
        { id: 'employment-history', label: 'Employment History', path: '/employees/history' },
        { id: 'promotions', label: 'Promotions', path: '/employees/promotions' },
        { id: 'transfers', label: 'Transfers', path: '/employees/transfers' },
        { id: 'exit-management', label: 'Exit Management', path: '/employees/exit' },
        { id: 'employee-documents', label: 'Employee Documents', path: '/employees/documents' }
      ]
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      roles: ['ALL'],
      children: [
        { id: 'daily-attendance', label: 'Daily Attendance', path: '/attendance/daily' },
        { id: 'gps-attendance', label: 'GPS Attendance', path: '/attendance/gps' },
        { id: 'regularization', label: 'Regularization', path: '/attendance/regularization' },
        { id: 'shift-roster', label: 'Shift Roster', path: '/attendance/shift-roster' },
        { id: 'overtime', label: 'Overtime', path: '/attendance/overtime' },
        { id: 'late-arrival', label: 'Late Arrival', path: '/attendance/late-arrival' },
        { id: 'attendance-reports', label: 'Attendance Reports', path: '/attendance/reports' },
        { id: 'punch-locations', label: 'Punch Locations', path: '/attendance/punch-locations' }
      ]
    },
    {
      id: 'leave-management',
      label: 'Leave Management',
      icon: CalendarOff,
      roles: ['ALL'],
      children: [
        { id: 'leave-dashboard', label: 'Leave Dashboard', path: '/leave-dashboard' },
        { id: 'leave-applications', label: 'Leave Applications', path: '/leave-applications' },
        { id: 'leave-approval', label: 'Leave Approval', path: '/leave-approval' },
        { id: 'leave-balance', label: 'Leave Balance', path: '/leave-balance' },
        { id: 'leave-types', label: 'Leave Types', path: '/leave-types' },
        { id: 'holiday-list', label: 'Holiday List', path: '/holiday-list' },
        { id: 'comp-off', label: 'Comp Off', path: '/comp-off' }
      ]
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: DollarSign,
      roles: ['ALL'],
      children: [
        { id: 'salary-structure', label: 'Salary Structure', path: '/payroll/salary-structure' },
        { id: 'salary-components', label: 'Salary Components', path: '/payroll/components' },
        { id: 'payroll-processing', label: 'Payroll Processing', path: '/payroll/processing' },
        { id: 'generate-payslips', label: 'Generate Payslips', path: '/payroll/payslips' },
        { id: 'bonus-incentives', label: 'Bonus & Incentives', path: '/payroll/bonus' },
        { id: 'reimbursements', label: 'Reimbursements', path: '/payroll/reimbursements' },
        { id: 'loans-advances', label: 'Loans & Advances', path: '/payroll/loans' },
        { id: 'tax-management', label: 'Tax Management', path: '/payroll/tax' },
        { id: 'payroll-reports', label: 'Payroll Reports', path: '/payroll/reports' }
      ]
    },
    {
      id: 'recruitment',
      label: 'Recruitment',
      icon: UserPlus,
      roles: ['ALL'],
      children: [
        { id: 'recruitment-dashboard', label: 'Dashboard', path: '/recruitment/dashboard' },
        { id: 'job-openings', label: 'Job Openings', path: '/recruitment/jobs' },
        { id: 'candidates', label: 'Candidates', path: '/recruitment/candidates' },
        { id: 'interview-schedule', label: 'Interview Schedule', path: '/recruitment/interviews' },
        { id: 'offer-letters', label: 'Offer Letters', path: '/recruitment/offers' },
        { id: 'hiring-pipeline', label: 'Hiring Pipeline', path: '/recruitment/pipeline' }
      ]
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: ClipboardList,
      roles: ['ALL'],
      children: [
        { id: 'new-joiners', label: 'New Joiners', path: '/onboarding/new-joiners' },
        { id: 'document-verification', label: 'Document Verification', path: '/onboarding/documents' },
        { id: 'asset-allocation', label: 'Asset Allocation', path: '/onboarding/assets' },
        { id: 'welcome-kit', label: 'Welcome Kit', path: '/onboarding/welcome-kit' },
        { id: 'orientation', label: 'Orientation', path: '/onboarding/orientation' },
        { id: 'probation', label: 'Probation', path: '/onboarding/probation' }
      ]
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: BarChart3,
      roles: ['ALL'],
      children: [
        { id: 'goals', label: 'Goals', path: '/performance/goals' },
        { id: 'kpi', label: 'KPI', path: '/performance/kpis' },
        { id: 'kras', label: 'KRAs', path: '/performance/kras' },
        { id: 'appraisals', label: 'Appraisals', path: '/performance/appraisals' },
        { id: 'reviews', label: 'Reviews', path: '/performance/reviews' },
        { id: 'feedback', label: 'Feedback', path: '/performance/feedback' },
        { id: 'promotions-performance', label: 'Promotions', path: '/performance/promotions' }
      ]
    },
    // {
    //   id: 'training',
    //   label: 'Training',
    //   icon: GraduationCap,
    //   roles: ['ALL'],
    //   children: [
    //     { id: 'training-programs', label: 'Training Programs' },
    //     { id: 'learning-portal', label: 'Learning Portal' },
    //     { id: 'trainers', label: 'Trainers' },
    //     { id: 'assessments', label: 'Assessments' },
    //     { id: 'certificates', label: 'Certificates' }
    //   ]
    // },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      roles: ['ALL'],
      children: [
        { id: 'project-dashboard', label: 'Project Dashboard', path: '/projects/dashboard' },
        { id: 'projects-list', label: 'Projects', path: '/projects/list' },
        { id: 'tasks', label: 'Tasks', path: '/projects/tasks' },
        { id: 'sprint-board', label: 'Sprint Board', path: '/projects/sprint-board' },
        { id: 'timesheets', label: 'Timesheets', path: '/projects/timesheets' },
        { id: 'milestones', label: 'Milestones', path: '/projects/milestones' },
        { id: 'team-members', label: 'Team Members', path: '/projects/team' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      roles: ['ALL'],
      children: [
        { id: 'employee-reports', label: 'Employee Reports', path: '/reports/employee' },
        { id: 'attendance-reports-module', label: 'Attendance Reports', path: '/reports/attendance' },
        { id: 'leave-reports', label: 'Leave Reports', path: '/reports/leave' },
        { id: 'payroll-reports-module', label: 'Payroll Reports', path: '/reports/payroll' },
        { id: 'recruitment-reports', label: 'Recruitment Reports', path: '/reports/recruitment' },
        { id: 'performance-reports', label: 'Performance Reports', path: '/reports/performance' },
        { id: 'project-reports', label: 'Project Reports', path: '/reports/project' }
      ]
    },
    // {
    //   id: 'assets',
    //   label: 'Assets',
    //   icon: Package,
    //   roles: ['ALL'],
    //   children: [
    //     { id: 'asset-categories', label: 'Asset Categories' },
    //     { id: 'asset-inventory', label: 'Asset Inventory' },
    //     { id: 'asset-allocation-module', label: 'Asset Allocation' },
    //     { id: 'asset-return', label: 'Asset Return' },
    //     { id: 'maintenance', label: 'Maintenance' },
    //     { id: 'asset-reports', label: 'Asset Reports' }
    //   ]
    // },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: Receipt,
      roles: ['ALL'],
      children: [
        { id: 'expense-claims', label: 'Expense Claims', path: '/expenses/claims' },
        { id: 'expense-categories', label: 'Expense Categories', path: '/expenses/categories' },
        { id: 'expense-approval', label: 'Expense Approval', path: '/expenses/approval' },
        { id: 'expense-reimbursements', label: 'Reimbursements', path: '/expenses/reimbursements' },
        { id: 'expense-reports', label: 'Expense Reports', path: '/expenses/reports' }
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      roles: ['ALL'],
      children: [
        { id: 'employee-documents-module', label: 'Employee Documents', path: '/documents/employee' },
        { id: 'company-documents', label: 'Company Documents', path: '/documents/company' },
        { id: 'hr-policies', label: 'HR Policies', path: '/documents/policies' },
        { id: 'templates', label: 'Templates', path: '/documents/templates' },
        { id: 'digital-signatures', label: 'Digital Signatures', path: '/documents/signatures' }
      ]
    },
    {
      id: 'help-desk',
      label: 'Help Desk',
      icon: LifeBuoy,
      roles: ['ALL'],
      children: [
        { id: 'help-desk-dashboard', label: 'Dashboard', path: '/help-desk/dashboard' },
        { id: 'tickets', label: 'Tickets', path: '/help-desk/tickets' },
        { id: 'categories', label: 'Categories', path: '/help-desk/categories' },
        { id: 'priorities', label: 'Priorities', path: '/help-desk/priorities' },
        { id: 'knowledge-base', label: 'Knowledge Base', path: '/help-desk/knowledge-base' },
        { id: 'help-desk-reports', label: 'Reports', path: '/help-desk/reports' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['ALL'],
      children: [
        { id: 'settings-company', label: 'Company Information', path: '/settings/company' },
        { id: 'settings-branding', label: 'Branding', path: '/settings/branding' },
        { id: 'settings-organization', label: 'Organization', path: '/settings/organization' },
        { id: 'settings-users', label: 'Users & Roles', path: '/settings/users' },
        { id: 'settings-hr', label: 'HR Settings', path: '/settings/hr' },
        { id: 'settings-communication', label: 'Communication', path: '/settings/communication' },
        { id: 'settings-integrations', label: 'Integrations', path: '/settings/integrations' },
        { id: 'settings-security', label: 'Security', path: '/settings/security' },
        { id: 'settings-system', label: 'System', path: '/settings/system' }
      ]
    }
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles?.includes('ALL') || item.roles?.includes(userRole)
  );

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.includes(item.id);

    // Check if any child's path matches the current location exactly, or if the item's path matches
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
                // Ensure default path fallback if we didn't update this child
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

    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path || `/${item.id}`)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium",
          isActive
            ? "custom-sidebar-btn-active bg-blue-600 text-white"
            : "custom-sidebar-btn"
        )}
      >
        <item.icon size={18} />
        {item.label}
      </button>
    );
  };

  return (
    <div className="w-64 custom-sidebar h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-5 custom-sidebar-border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 custom-sidebar-logo-bg rounded-lg flex items-center justify-center">
            <Bird size={22} className="text-white" />
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

      {/* Need Help Support Card */}
      <div className="p-3">
        <div style={{ background: '#1E293B', borderRadius: 12, padding: 14, border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Need Help?</span>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
              🎧
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 10px', lineHeight: 1.3 }}>
            Our support team is ready to help you.
          </p>
          <button style={{
            width: '100%', height: 32, background: '#2952E3', color: '#FFF', border: 'none',
            borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            Contact Support
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 custom-sidebar-border-t">
        <div className="custom-sidebar-profile-bg rounded-lg p-3 flex items-center gap-3">
          <div 
            onClick={handleProfileClick}
            style={{ cursor: 'pointer' }}
            className="flex flex-1 items-center gap-3 min-w-0 hover:opacity-85 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full custom-sidebar-profile-avatar-bg flex items-center justify-center text-xs font-bold flex-shrink-0">
              {(localStorage.getItem('userName') || 'John Doe').split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{localStorage.getItem('userName') || 'John Doe'}</p>
              <p className="text-xs text-slate-400 truncate">{localStorage.getItem('userRole') || 'Super Admin'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-slate-400 hover:text-red-400 transition-colors p-1 flex-shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
