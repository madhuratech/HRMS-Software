import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LayoutDashboard, Building2, Users, CalendarCheck, CalendarOff, DollarSign,
  UserPlus, ClipboardList, BarChart3, FolderKanban, FileBarChart, Receipt,
  FileText, LifeBuoy, Settings, ChevronDown, ChevronRight, LogOut,
  Network, Clock, Sparkles, Calendar, TrendingUp, Activity
} from 'lucide-react-native';

const employeeMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'EmployeeDashboard' },
  { id: 'profile', label: 'My Profile', icon: Users, path: 'EmployeeProfile' },
  { id: 'attendance', label: 'My Attendance', icon: CalendarCheck, path: 'AttendanceMain' },
  { id: 'shift', label: 'My Shift', icon: Clock, path: 'ShiftRoster' },
  { id: 'leave', label: 'My Leave', icon: CalendarOff, path: 'LeaveMain' },
  { id: 'leave-types', label: 'Leave Types', icon: CalendarOff, path: 'LeaveTypes' },
  { id: 'holiday-list', label: 'Holiday List', icon: Calendar, path: 'HolidayList' },
  { id: 'payroll', label: 'My Payroll', icon: DollarSign, path: 'SalaryStructure' },
  { id: 'tasks', label: 'My Tasks', icon: ClipboardList, path: 'Tasks' },
  { id: 'team', label: 'My Team', icon: Network, path: 'Teams' },
  { id: 'performance', label: 'My Performance', icon: BarChart3, path: 'Goals' },
  { id: 'documents', label: 'My Documents', icon: FileText, path: 'EmployeeDocumentsModule' },
  { id: 'announcements', label: 'Announcements', icon: Sparkles, path: 'DashboardMain' },
  { id: 'help', label: 'Help & Support', icon: LifeBuoy, path: 'HelpDeskDashboard' },
];

const teamLeaderMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'EmployeeDashboard' },
  { id: 'profile', label: 'My Profile', icon: Users, path: 'EmployeeProfile' },
  { id: 'my-attendance', label: 'My Attendance', icon: CalendarCheck, path: 'AttendanceMain' },
  { id: 'my-shift', label: 'My Shift', icon: Clock, path: 'ShiftRoster' },
  { id: 'my-team', label: 'My Team', icon: Network, path: 'Teams' },
  { id: 'team-attendance', label: 'Team Attendance', icon: CalendarCheck, path: 'AttendanceReports' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, path: 'ProjectDashboard' },
  { id: 'team-tasks', label: 'Team Tasks', icon: ClipboardList, path: 'Tasks' },
  { id: 'team-performance', label: 'Team Performance', icon: BarChart3, path: 'KPI' },
  { id: 'my-leave', label: 'My Leave', icon: CalendarOff, path: 'LeaveMain' },
  { id: 'team-leave', label: 'Team Leave Overview', icon: CalendarOff, path: 'LeaveApproval' },
  { id: 'holidays', label: 'Holiday List', icon: CalendarOff, path: 'HolidayCalendar' },
  { id: 'leave-types', label: 'Leave Types', icon: CalendarOff, path: 'LeaveTypes' },
  { id: 'my-payroll', label: 'My Payroll', icon: DollarSign, path: 'SalaryStructure' },
  { id: 'help', label: 'Help & Support', icon: LifeBuoy, path: 'HelpDeskDashboard' },
];

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'DashboardMain' },
  {
    id: 'organization', label: 'Organization', icon: Building2,
    children: [
      { id: 'company-profile', label: 'Company Profile', path: 'CompanyProfile' },
      { id: 'departments', label: 'Departments', path: 'Departments' },
      { id: 'designations', label: 'Designations', path: 'Designations' },
      { id: 'teams', label: 'Teams', path: 'Teams' },
      { id: 'shift-management', label: 'Shift Management', path: 'ShiftManagement' },
      { id: 'holiday-calendar', label: 'Holiday Calendar', path: 'HolidayCalendar' },
      { id: 'organization-chart', label: 'Organization Chart', path: 'OrganizationChart' },
      { id: 'user-roles', label: 'User Roles & Permissions', path: 'UserRoles' }
    ]
  },
  {
    id: 'employees', label: 'Employees', icon: Users,
    children: [
      { id: 'employee-dashboard', label: 'Employee Dashboard', path: 'EmployeeDashboard' },
      { id: 'employee-directory', label: 'Employee Directory', path: 'EmployeeDirectory' },
      { id: 'employee-list', label: 'Employee List', path: 'EmployeeList' },
      { id: 'add-employee', label: 'Add Employee', path: 'AddEmployee' },
      { id: 'employee-profile', label: 'Employee Profile', path: 'EmployeeProfile' },
      { id: 'employment-history', label: 'Employment History', path: 'EmploymentHistory' },
      { id: 'promotions', label: 'Promotions', path: 'Promotions' },
      { id: 'transfers', label: 'Transfers', path: 'Transfers' },
      { id: 'exit-management', label: 'Exit Management', path: 'ExitManagement' },
      { id: 'employee-documents', label: 'Employee Documents', path: 'EmployeeDocuments' }
    ]
  },
  {
    id: 'attendance', label: 'Attendance', icon: CalendarCheck,
    children: [
      { id: 'daily-attendance', label: 'Daily Attendance', path: 'DailyAttendance' },
      { id: 'gps-attendance', label: 'GPS Attendance', path: 'AttendanceMain' },
      { id: 'regularization', label: 'Regularization', path: 'Regularization' },
      { id: 'shift-roster', label: 'Shift Roster', path: 'ShiftRoster' },
      { id: 'overtime', label: 'Overtime', path: 'Overtime' },
      { id: 'late-arrival', label: 'Late Arrival', path: 'LateArrival' },
      { id: 'punch-locations', label: 'Punch Locations', path: 'AttendanceMain' }
    ]
  },
  {
    id: 'leave-management', label: 'Leave Management', icon: CalendarOff,
    children: [
      { id: 'leave-dashboard', label: 'Leave Dashboard', path: 'LeaveMain' },
      { id: 'leave-applications', label: 'Leave Applications', path: 'LeaveApplications' },
      { id: 'leave-approval', label: 'Leave Approval', path: 'LeaveApproval' },
      { id: 'leave-balance', label: 'Leave Balance', path: 'LeaveBalance' },
      { id: 'leave-types', label: 'Leave Types', path: 'LeaveTypes' },
      { id: 'holiday-list', label: 'Holiday List', path: 'HolidayList' },
      { id: 'comp-off', label: 'Comp Off', path: 'CompOff' }
    ]
  },
  {
    id: 'payroll', label: 'Payroll', icon: DollarSign,
    children: [
      { id: 'salary-structure', label: 'Salary Structure', path: 'SalaryStructure' },
      { id: 'salary-components', label: 'Salary Components', path: 'SalaryComponents' },
      { id: 'payroll-processing', label: 'Payroll Processing', path: 'PayrollProcessing' },
      { id: 'generate-payslips', label: 'Generate Payslips', path: 'GeneratePayslips' },
      { id: 'bonus-incentives', label: 'Bonus & Incentives', path: 'BonusIncentives' },
      { id: 'reimbursements', label: 'Reimbursements', path: 'Reimbursements' },
      { id: 'loans-advances', label: 'Loans & Advances', path: 'LoansAdvances' },
      { id: 'tax-management', label: 'Tax Management', path: 'TaxManagement' }
    ]
  },
  {
    id: 'recruitment', label: 'Recruitment', icon: UserPlus,
    children: [
      { id: 'recruitment-dashboard', label: 'Dashboard', path: 'RecruitmentDashboard' },
      { id: 'job-openings', label: 'Job Openings', path: 'JobOpenings' },
      { id: 'candidates', label: 'Candidates', path: 'Candidates' },
      { id: 'interview-schedule', label: 'Interview Schedule', path: 'InterviewSchedule' },
      { id: 'offer-letters', label: 'Offer Letters', path: 'OfferLetters' },
      { id: 'hiring-pipeline', label: 'Hiring Pipeline', path: 'HiringPipeline' }
    ]
  },
  {
    id: 'onboarding', label: 'Onboarding', icon: ClipboardList,
    children: [
      { id: 'new-joiners', label: 'New Joiners', path: 'NewJoiners' },
      { id: 'document-verification', label: 'Document Verification', path: 'DocumentVerification' },
      { id: 'asset-allocation', label: 'Asset Allocation', path: 'AssetAllocation' },
      { id: 'welcome-kit', label: 'Welcome Kit', path: 'WelcomeKit' },
      { id: 'orientation', label: 'Orientation', path: 'Orientation' },
      { id: 'probation', label: 'Probation', path: 'Probation' }
    ]
  },
  {
    id: 'performance', label: 'Performance', icon: BarChart3,
    children: [
      { id: 'goals', label: 'Goals', path: 'Goals' },
      { id: 'kpi', label: 'KPI', path: 'KPI' },
      { id: 'kras', label: 'KRAs', path: 'KRAs' },
      { id: 'appraisals', label: 'Appraisals', path: 'Appraisals' },
      { id: 'reviews', label: 'Reviews', path: 'Reviews' },
      { id: 'feedback', label: 'Feedback', path: 'Feedback' },
      { id: 'promotions-performance', label: 'Promotions', path: 'Promotions' }
    ]
  },
  {
    id: 'projects', label: 'Projects', icon: FolderKanban,
    children: [
      { id: 'project-dashboard', label: 'Project Dashboard', path: 'ProjectDashboard' },
      { id: 'projects-list', label: 'Projects', path: 'ProjectsList' },
      { id: 'tasks', label: 'Tasks', path: 'Tasks' },
      { id: 'sprint-board', label: 'Sprint Board', path: 'SprintBoard' },
      { id: 'timesheets', label: 'Timesheets', path: 'Timesheets' },
      { id: 'milestones', label: 'Milestones', path: 'Milestones' },
      { id: 'team-members', label: 'Team Members', path: 'TeamMembers' }
    ]
  },
  { id: 'reports', label: 'Reports', icon: FileBarChart, path: 'AnalyticsReports' },
  {
    id: 'expenses', label: 'Expenses', icon: Receipt,
    children: [
      { id: 'expense-claims', label: 'Expense Claims', path: 'ExpenseClaims' },
      { id: 'expense-categories', label: 'Expense Categories', path: 'ExpenseCategories' },
      { id: 'expense-approval', label: 'Expense Approval', path: 'ExpenseApproval' },
      { id: 'expense-reimbursements', label: 'Reimbursements', path: 'Reimbursements' },
      { id: 'expense-reports', label: 'Expense Reports', path: 'ExpenseReports' }
    ]
  },
  {
    id: 'documents', label: 'Documents', icon: FileText,
    children: [
      { id: 'employee-documents-module', label: 'Employee Documents', path: 'EmployeeDocumentsModule' },
      { id: 'company-documents', label: 'Company Documents', path: 'CompanyDocuments' },
      { id: 'hr-policies', label: 'HR Policies', path: 'HRPolicies' },
      { id: 'templates', label: 'Templates', path: 'Templates' },
      { id: 'digital-signatures', label: 'Digital Signatures', path: 'DigitalSignatures' }
    ]
  },
  {
    id: 'help-desk', label: 'Help Desk', icon: LifeBuoy,
    children: [
      { id: 'help-desk-dashboard', label: 'Dashboard', path: 'HelpDeskDashboard' },
      { id: 'tickets', label: 'Tickets', path: 'Tickets' },
      { id: 'categories', label: 'Categories', path: 'Categories' },
      { id: 'priorities', label: 'Priorities', path: 'Priorities' },
      { id: 'help-desk-reports', label: 'Reports', path: 'HelpDeskReports' }
    ]
  },
  {
    id: 'settings', label: 'Settings', icon: Settings,
    children: [
      { id: 'settings-company', label: 'Company Information', path: 'SettingsCompany' },
      { id: 'settings-branding', label: 'Branding', path: 'SettingsBranding' },
      { id: 'settings-organization', label: 'Organization', path: 'SettingsOrganization' },
      { id: 'settings-users', label: 'Users & Roles', path: 'SettingsUsers' },
      { id: 'settings-hr', label: 'HR Settings', path: 'SettingsHR' },
      { id: 'settings-communication', label: 'Communication', path: 'SettingsCommunication' },
      { id: 'settings-integrations', label: 'Integrations', path: 'SettingsIntegrations' },
      { id: 'settings-security', label: 'Security', path: 'SettingsSecurity' },
      { id: 'settings-system', label: 'System', path: 'SettingsSystem' }
    ]
  },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, path: 'AIAssistant' },
];

export default function CustomDrawerContent({ navigation, state }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [expandedGroups, setExpandedGroups] = useState([]);

  const roleStr = String(user?.role || user?.type || '').toUpperCase();
  const isEmployee = roleStr === 'EMPLOYEE' || roleStr === 'STAFF';
  const isTeamLeader = roleStr === 'TEAM_LEADER' || roleStr === 'TEAM LEADER';
  
  const targetMenu = isEmployee ? employeeMenuItems : isTeamLeader ? teamLeaderMenuItems : menuItems;

  const currentRouteName = state?.routeNames[state?.index] || '';

  // Auto-expand group containing current route
  useEffect(() => {
    const matchingGroup = targetMenu.find(item => {
      if (item.children) {
        return item.children.some(child => child.path === currentRouteName);
      }
      return false;
    });

    if (matchingGroup) {
      setExpandedGroups([matchingGroup.id]);
    }
  }, [currentRouteName, targetMenu]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [groupId] // collapse others or just toggle? web just toggles one: `prev.includes(groupId) ? [] : [groupId]`
    );
  };

  const handleNav = (path) => {
    if (path) {
      navigation.navigate(path);
    }
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.includes(item.id);
    const isActive = item.path === currentRouteName || (hasChildren && item.children.some(child => child.path === currentRouteName));
    const isAIAssistant = item.id === 'ai-assistant';

    if (hasChildren) {
      return (
        <View key={item.id}>
          <TouchableOpacity
            onPress={() => toggleGroup(item.id)}
            style={[
              styles.menuItem,
              isActive ? styles.menuItemActive : null
            ]}
          >
            {item.icon ? (
              <item.icon size={18} color={isActive ? '#FFFFFF' : '#94A3B8'} />
            ) : (
              <Activity size={18} color={isActive ? '#FFFFFF' : '#94A3B8'} />
            )}
            <Text style={[styles.menuItemText, isActive ? styles.menuItemTextActive : null]}>
              {item.label}
            </Text>
            {isExpanded ? (
              <ChevronDown size={16} color={isActive ? '#FFFFFF' : '#94A3B8'} />
            ) : (
              <ChevronRight size={16} color={isActive ? '#FFFFFF' : '#94A3B8'} />
            )}
          </TouchableOpacity>
          
          {isExpanded && (
            <View style={styles.subMenuContainer}>
              {item.children.map(child => {
                const isChildActive = child.path === currentRouteName;
                return (
                  <TouchableOpacity
                    key={child.id}
                    onPress={() => handleNav(child.path)}
                    style={[
                      styles.subMenuItem,
                      isChildActive ? styles.subMenuItemActive : null
                    ]}
                  >
                    <Text style={[
                      styles.subMenuItemText,
                      isChildActive ? styles.subMenuItemTextActive : null
                    ]}>
                      {child.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleNav(item.path)}
        style={[
          styles.menuItem,
          isActive
            ? (isAIAssistant ? styles.aiMenuItemActive : styles.menuItemActive)
            : null
        ]}
      >
        {item.icon ? (
          <item.icon
            size={18}
            color={isActive ? '#FFFFFF' : (isAIAssistant ? '#8B5CF6' : '#94A3B8')}
          />
        ) : (
          <Activity
            size={18}
            color={isActive ? '#FFFFFF' : (isAIAssistant ? '#8B5CF6' : '#94A3B8')}
          />
        )}
        <Text style={[
          styles.menuItemText,
          isActive ? styles.menuItemTextActive : (isAIAssistant ? { color: '#8B5CF6', fontWeight: 'bold' } : null)
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.brandIconContainer}>
           <LinearGradient 
              colors={['#3B82F6', '#1D4ED8']} 
              style={styles.brandIconGradient} 
            >
             <TrendingUp size={24} color="#FFFFFF" />
           </LinearGradient>
        </View>
        <View>
          <Text style={styles.brandTitle}>HAWKEYE NEST</Text>
          <Text style={styles.brandSubtitle}>HRMS</Text>
        </View>
      </View>

      {/* Navigation List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {targetMenu.map(item => renderMenuItem(item))}
      </ScrollView>

      {/* User Profile Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.profileContainer}>
          <TouchableOpacity 
            style={styles.profileInfo}
            onPress={() => handleNav(isEmployee ? 'EmployeeProfile' : 'CompanyProfile')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName} numberOfLines={1}>{user?.name || 'User Name'}</Text>
              <Text style={styles.profileRole} numberOfLines={1}>{user?.employeeId || user?.role || user?.type || 'User'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <LogOut size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate-900 matching web
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  brandIconContainer: {
    marginRight: 12,
  },
  brandIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#93C5FD', // blue-300
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#2563EB', // blue-600
  },
  aiMenuItemActive: {
    backgroundColor: '#7C3AED', // violet-600
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#CBD5E1', // slate-300
    marginLeft: 12,
  },
  menuItemTextActive: {
    color: '#FFFFFF',
  },
  subMenuContainer: {
    marginLeft: 16,
    marginTop: 2,
    marginBottom: 8,
  },
  subMenuItem: {
    paddingVertical: 10,
    paddingLeft: 40,
    paddingRight: 16,
    borderRadius: 8,
  },
  subMenuItemActive: {
    backgroundColor: '#2563EB',
  },
  subMenuItemText: {
    fontSize: 13,
    color: '#94A3B8', // slate-400
  },
  subMenuItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59,130,246,0.2)', // blue-500/20
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#60A5FA', // blue-400
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  profileRole: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
  }
});
