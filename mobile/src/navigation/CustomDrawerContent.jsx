import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { 
  LayoutDashboard, Building2, Users, CalendarCheck, CalendarOff, DollarSign, 
  UserPlus, ClipboardList, BarChart3, FolderKanban, FileBarChart, Receipt, 
  FileText, LifeBuoy, Settings, ChevronDown, ChevronRight, LogOut, Bird, BookOpen 
} from 'lucide-react-native';

const superAdminMenuItems = [
  { id: 'DashboardMain', label: 'Dashboard', icon: LayoutDashboard, path: 'DashboardMain' },
  { id: 'CompanyProfile', label: 'Company Profile', icon: Building2, path: 'CompanyProfile' },
  { id: 'Departments', label: 'Departments', icon: Building2, path: 'Departments' },
  { id: 'Designations', label: 'Designations', icon: Building2, path: 'Designations' },
  { id: 'Teams', label: 'Teams', icon: Users, path: 'Teams' },
  { id: 'OrganizationChart', label: 'Organization Chart', icon: Building2, path: 'OrganizationChart' },
  { id: 'HolidayCalendar', label: 'Holiday Calendar', icon: CalendarOff, path: 'HolidayCalendar' },
  { id: 'ShiftManagement', label: 'Shift Management', icon: CalendarCheck, path: 'ShiftManagement' },
  { id: 'EmployeeList', label: 'Employees', icon: Users, path: 'EmployeeList' },
  { id: 'EmployeeProfile', label: 'Employee Details', icon: UserPlus, path: 'EmployeeProfile' },
  { id: 'Tasks', label: 'Tasks', icon: FolderKanban, path: 'Tasks' },
  { id: 'TaskBoard', label: 'Task Board', icon: FolderKanban, path: 'SprintBoard' },
  { id: 'NewJob', label: 'New Job', icon: ClipboardList, path: 'JobOpenings' },
  { id: 'TaskDetails', label: 'Task Details', icon: FileText, path: 'TaskDetails' },
  { id: 'Timesheets', label: 'Timesheets', icon: CalendarCheck, path: 'Timesheets' },
  { id: 'SalesEnquiries', label: 'Sales Enquiries', icon: DollarSign, path: 'SalesEnquiries' },
  { id: 'SalesEntry', label: 'Sales Entry', icon: DollarSign, path: 'SalesEntry' },
  { id: 'CustomerSalesDetails', label: 'Customer Sales Details', icon: Users, path: 'CustomerSalesDetails' },
  { id: 'FollowUp', label: 'Follow-up', icon: FileText, path: 'FollowUp' },
  { id: 'Training', label: 'Training', icon: BookOpen, path: 'Training' },
  { id: 'HelpDesk', label: 'Help Desk', icon: LifeBuoy, path: 'HelpDeskDashboard' },
  { id: 'SupportTickets', label: 'Support Tickets', icon: LifeBuoy, path: 'Tickets' },
  { id: 'AnalyticsReports', label: 'Analytics Reports', icon: BarChart3, path: 'AnalyticsReports' },
  { id: 'SettingsSystem', label: 'Settings', icon: Settings, path: 'SettingsSystem' }
];

const menuItems = [
  { id: 'DashboardMain', label: 'Dashboard', icon: LayoutDashboard, path: 'DashboardMain' },
  {
    id: 'organization', label: 'Organization', icon: Building2,
    children: [
      { id: 'CompanyProfile', label: 'Company Profile', path: 'CompanyProfile' },
      { id: 'Departments', label: 'Departments', path: 'Departments' },
      { id: 'Designations', label: 'Designations', path: 'Designations' },
      { id: 'Teams', label: 'Teams', path: 'Teams' },
      { id: 'ShiftManagement', label: 'Shift Management', path: 'ShiftManagement' },
      { id: 'HolidayCalendar', label: 'Holiday Calendar', path: 'HolidayCalendar' },
      { id: 'OrganizationChart', label: 'Organization Chart', path: 'OrganizationChart' }
    ]
  },
  {
    id: 'employees', label: 'Employees', icon: Users,
    children: [
      { id: 'EmployeeDirectory', label: 'Employee Directory', path: 'EmployeeDirectory' },
      { id: 'EmployeeList', label: 'Employee List', path: 'EmployeeList' },
      { id: 'AddEmployee', label: 'Add Employee', path: 'AddEmployee' },
      { id: 'EmployeeProfile', label: 'Employee Profile', path: 'EmployeeProfile' },
      { id: 'EmploymentHistory', label: 'Employment History', path: 'EmploymentHistory' },
      { id: 'Promotions', label: 'Promotions', path: 'Promotions' },
      { id: 'Transfers', label: 'Transfers', path: 'Transfers' },
      { id: 'ExitManagement', label: 'Exit Management', path: 'ExitManagement' },
      { id: 'EmployeeDocuments', label: 'Employee Documents', path: 'EmployeeDocuments' }
    ]
  },
  {
    id: 'attendance', label: 'Attendance', icon: CalendarCheck,
    children: [
      { id: 'DailyAttendance', label: 'Daily Attendance', path: 'DailyAttendance' },
      { id: 'GpsAttendance', label: 'GPS Attendance', path: 'AttendanceMain' },
      { id: 'Regularization', label: 'Regularization', path: 'Regularization' },
      { id: 'ShiftRoster', label: 'Shift Roster', path: 'ShiftRoster' },
      { id: 'Overtime', label: 'Overtime', path: 'Overtime' },
      { id: 'LateArrival', label: 'Late Arrival', path: 'LateArrival' },
      { id: 'AttendanceReports', label: 'Attendance Reports', path: 'AttendanceReports' }
    ]
  },
  {
    id: 'leave-management', label: 'Leave Management', icon: CalendarOff,
    children: [
      { id: 'LeaveDashboard', label: 'Leave Dashboard', path: 'LeaveMain' },
      { id: 'LeaveApplications', label: 'Leave Applications', path: 'LeaveApplications' },
      { id: 'LeaveApproval', label: 'Leave Approval', path: 'LeaveApproval' },
      { id: 'LeaveBalance', label: 'Leave Balance', path: 'LeaveBalance' },
      { id: 'LeaveTypes', label: 'Leave Types', path: 'LeaveTypes' },
      { id: 'HolidayList', label: 'Holiday List', path: 'HolidayList' },
      { id: 'CompOff', label: 'Comp Off', path: 'CompOff' }
    ]
  },
  {
    id: 'payroll', label: 'Payroll', icon: DollarSign,
    children: [
      { id: 'SalaryStructure', label: 'Salary Structure', path: 'SalaryStructure' },
      { id: 'SalaryComponents', label: 'Salary Components', path: 'SalaryComponents' },
      { id: 'PayrollProcessing', label: 'Payroll Processing', path: 'PayrollProcessing' },
      { id: 'GeneratePayslips', label: 'Generate Payslips', path: 'GeneratePayslips' },
      { id: 'BonusIncentives', label: 'Bonus & Incentives', path: 'BonusIncentives' },
      { id: 'Reimbursements', label: 'Reimbursements', path: 'Reimbursements' },
      { id: 'LoansAdvances', label: 'Loans & Advances', path: 'LoansAdvances' },
      { id: 'TaxManagement', label: 'Tax Management', path: 'TaxManagement' },
      { id: 'PayrollReports', label: 'Payroll Reports', path: 'PayrollReports' }
    ]
  },
  {
    id: 'recruitment', label: 'Recruitment', icon: UserPlus,
    children: [
      { id: 'RecruitmentDashboard', label: 'Dashboard', path: 'RecruitmentDashboard' },
      { id: 'JobOpenings', label: 'Job Openings', path: 'JobOpenings' },
      { id: 'Candidates', label: 'Candidates', path: 'Candidates' },
      { id: 'InterviewSchedule', label: 'Interview Schedule', path: 'InterviewSchedule' },
      { id: 'OfferLetters', label: 'Offer Letters', path: 'OfferLetters' },
      { id: 'HiringPipeline', label: 'Hiring Pipeline', path: 'HiringPipeline' }
    ]
  },
  {
    id: 'onboarding', label: 'Onboarding', icon: ClipboardList,
    children: [
      { id: 'NewJoiners', label: 'New Joiners', path: 'NewJoiners' },
      { id: 'DocumentVerification', label: 'Document Verification', path: 'DocumentVerification' },
      { id: 'AssetAllocation', label: 'Asset Allocation', path: 'AssetAllocation' },
      { id: 'WelcomeKit', label: 'Welcome Kit', path: 'WelcomeKit' },
      { id: 'Orientation', label: 'Orientation', path: 'Orientation' },
      { id: 'Probation', label: 'Probation', path: 'Probation' }
    ]
  },
  {
    id: 'performance', label: 'Performance', icon: BarChart3,
    children: [
      { id: 'Goals', label: 'Goals', path: 'Goals' },
      { id: 'KPI', label: 'KPI', path: 'KPI' },
      { id: 'KRAs', label: 'KRAs', path: 'KRAs' },
      { id: 'Appraisals', label: 'Appraisals', path: 'Appraisals' },
      { id: 'Reviews', label: 'Reviews', path: 'Reviews' },
      { id: 'Feedback', label: 'Feedback', path: 'Feedback' },
      { id: 'PromotionsPerformance', label: 'Promotions', path: 'PromotionsPerformance' }
    ]
  },
  {
    id: 'projects', label: 'Projects', icon: FolderKanban,
    children: [
      { id: 'ProjectDashboard', label: 'Project Dashboard', path: 'ProjectDashboard' },
      { id: 'ProjectsList', label: 'Projects', path: 'ProjectsList' },
      { id: 'Tasks', label: 'Tasks', path: 'Tasks' },
      { id: 'SprintBoard', label: 'Sprint Board', path: 'SprintBoard' },
      { id: 'Timesheets', label: 'Timesheets', path: 'Timesheets' },
      { id: 'Milestones', label: 'Milestones', path: 'Milestones' },
      { id: 'TeamMembers', label: 'Team Members', path: 'TeamMembers' }
    ]
  },
  {
    id: 'reports', label: 'Reports', icon: FileBarChart,
    children: [
      { id: 'EmployeeReports', label: 'Employee Reports', path: 'EmployeeReports' },
      { id: 'AttendanceReportsModule', label: 'Attendance Reports', path: 'AttendanceReportsModule' },
      { id: 'LeaveReports', label: 'Leave Reports', path: 'LeaveReports' },
      { id: 'PayrollReportsModule', label: 'Payroll Reports', path: 'PayrollReportsModule' },
      { id: 'RecruitmentReports', label: 'Recruitment Reports', path: 'RecruitmentReports' },
      { id: 'PerformanceReports', label: 'Performance Reports', path: 'PerformanceReports' },
      { id: 'ProjectReports', label: 'Project Reports', path: 'ProjectReports' }
    ]
  },
  {
    id: 'sales', label: 'Sales', icon: DollarSign,
    children: [
      { id: 'SalesEnquiries', label: 'Sales Enquiries', path: 'SalesEnquiries' },
      { id: 'SalesEntry', label: 'Sales Entry', path: 'SalesEntry' },
      { id: 'CustomerSalesDetails', label: 'Customer Details', path: 'CustomerSalesDetails' },
      { id: 'FollowUp', label: 'Follow-ups', path: 'FollowUp' }
    ]
  },
  {
    id: 'expenses', label: 'Expenses', icon: Receipt,
    children: [
      { id: 'ExpenseClaims', label: 'Expense Claims', path: 'ExpenseClaims' },
      { id: 'ExpenseCategories', label: 'Expense Categories', path: 'ExpenseCategories' },
      { id: 'ExpenseApproval', label: 'Expense Approval', path: 'ExpenseApproval' },
      { id: 'ExpenseReimbursements', label: 'Reimbursements', path: 'ExpenseReimbursements' },
      { id: 'ExpenseReports', label: 'Expense Reports', path: 'ExpenseReports' }
    ]
  },
  {
    id: 'documents', label: 'Documents', icon: FileText,
    children: [
      { id: 'EmployeeDocumentsModule', label: 'Employee Documents', path: 'EmployeeDocumentsModule' },
      { id: 'CompanyDocuments', label: 'Company Documents', path: 'CompanyDocuments' },
      { id: 'HRPolicies', label: 'HR Policies', path: 'HRPolicies' },
      { id: 'Templates', label: 'Templates', path: 'Templates' },
      { id: 'DigitalSignatures', label: 'Digital Signatures', path: 'DigitalSignatures' }
    ]
  },
  {
    id: 'help-desk', label: 'Help Desk', icon: LifeBuoy,
    children: [
      { id: 'HelpDeskDashboard', label: 'Dashboard', path: 'HelpDeskDashboard' },
      { id: 'Tickets', label: 'Tickets', path: 'Tickets' },
      { id: 'Categories', label: 'Categories', path: 'Categories' },
      { id: 'Priorities', label: 'Priorities', path: 'Priorities' },
      { id: 'KnowledgeBase', label: 'Knowledge Base', path: 'KnowledgeBase' },
      { id: 'HelpDeskReports', label: 'Reports', path: 'HelpDeskReports' }
    ]
  },
  {
    id: 'settings', label: 'Settings', icon: Settings,
    children: [
      { id: 'SettingsCompany', label: 'Company Information', path: 'SettingsCompany' },
      { id: 'SettingsBranding', label: 'Branding', path: 'SettingsBranding' },
      { id: 'SettingsOrganization', label: 'Organization', path: 'SettingsOrganization' },
      { id: 'SettingsUsers', label: 'Users & Roles', path: 'SettingsUsers' },
      { id: 'SettingsHR', label: 'HR Settings', path: 'SettingsHR' },
      { id: 'SettingsCommunication', label: 'Communication', path: 'SettingsCommunication' },
      { id: 'SettingsIntegrations', label: 'Integrations', path: 'SettingsIntegrations' },
      { id: 'SettingsSecurity', label: 'Security', path: 'SettingsSecurity' },
      { id: 'SettingsSystem', label: 'System', path: 'SettingsSystem' }
    ]
  }
];

export default function CustomDrawerContent(props) {
  const [expandedGroups, setExpandedGroups] = useState(['organization', 'employees']);
  const { user, logout } = useAuth();
  
  // Filter menu items based on role
  const getFilteredMenu = () => {
    // Determine the role, defaulting to empty string if undefined
    const role = user?.role || user?.role_name || '';
    
    // For Super Admin and Admin, grant full access (Super Admin hides GpsAttendance)
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      if (role === 'SUPER_ADMIN') {
        return menuItems.map(item => {
          if (item.id === 'attendance') {
            return {
              ...item,
              children: item.children.filter(child => child.id !== 'GpsAttendance')
            };
          }
          return item;
        });
      }
      return menuItems;
    }
    
    // For Employees, and any other unrecognized roles (Default fallback)
    return [
      { id: 'EmployeeDashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'EmployeeDashboard' },
      menuItems.find(i => i.id === 'attendance'),
      menuItems.find(i => i.id === 'leave-management'),
      {
        id: 'employees', label: 'My Profile', icon: Users,
        children: [
          { id: 'EmployeeProfile', label: 'View Profile', path: 'EmployeeProfile' },
          { id: 'EmployeeDocuments', label: 'My Documents', path: 'EmployeeDocuments' }
        ]
      },
      menuItems.find(i => i.id === 'settings'),
    ].filter(Boolean); // removes undefined if not found
  };

  const filteredMenuItems = getFilteredMenu();

  // Note: we're using current route name to handle active states
  const currentRouteName = props.state.routes[props.state.index].name;

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [groupId] // Accordion mode: only one open at a time
    );
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.includes(item.id);

    const isActive = item.path === currentRouteName || (hasChildren && item.children.some(child => child.path === currentRouteName));

    if (hasChildren) {
      return (
        <View key={item.id} style={styles.menuGroup}>
          <TouchableOpacity
            style={[styles.menuItem, isActive && styles.menuItemActive]}
            onPress={() => toggleGroup(item.id)}
          >
            <item.icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
            {isExpanded ? (
              <ChevronDown size={16} color={isActive ? '#ffffff' : '#94a3b8'} />
            ) : (
              <ChevronRight size={16} color={isActive ? '#ffffff' : '#94a3b8'} />
            )}
          </TouchableOpacity>
          
          {isExpanded && (
            <View style={styles.childContainer}>
              {item.children.map(child => {
                const isChildActive = currentRouteName === child.path;
                return (
                  <TouchableOpacity
                    key={child.id}
                    style={[styles.childItem, isChildActive && styles.menuItemActive]}
                    onPress={() => props.navigation.navigate(child.path)}
                  >
                    <Text style={[styles.childLabel, isChildActive && styles.menuLabelActive]}>
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
        style={[styles.menuItem, isActive && styles.menuItemActive]}
        onPress={() => props.navigation.navigate(item.path)}
      >
        <item.icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} style={styles.menuIcon} />
        <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
      {/* Header Logo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoBox}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: '100%', height: '100%', borderRadius: 8 }} 
              resizeMode="contain" 
            />
          </View>
          <View>
            <Text style={styles.brandTitle}>MADHURA HRMS</Text>
            <Text style={styles.brandSubtitle}>HRMS</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.navScroll}>
        <View style={styles.navContainer}>
          {filteredMenuItems.map(item => renderMenuItem(item))}
        </View>
      </ScrollView>

      {/* Need Help Support Card */}
      <View style={styles.supportCardContainer}>
        <View style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <View style={styles.supportIconBox}>
              <Text style={{ fontSize: 12 }}>🎧</Text>
            </View>
          </View>
          <Text style={styles.supportText}>Our support team is ready to help you.</Text>
          <TouchableOpacity style={styles.supportBtn}>
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Profile */}
      <View style={styles.footer}>
        <View style={styles.profileBox}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'SA'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Super Admin'}</Text>
            <Text style={styles.profileRole}>{user?.role?.replace('_', ' ') || 'Administrator'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <LogOut size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b', // slate-800
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  navScroll: {
    flex: 1,
  },
  navContainer: {
    padding: 12,
    gap: 4,
  },
  menuGroup: {
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#1d4ed8', // .custom-sidebar-btn-active
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 3,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  menuLabelActive: {
    color: '#ffffff',
  },
  childContainer: {
    marginLeft: 16,
    marginTop: 4,
    gap: 2,
  },
  childItem: {
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  childLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  supportCardContainer: {
    padding: 12,
  },
  supportCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  supportIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportText: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 10,
    lineHeight: 15,
  },
  supportBtn: {
    width: '100%',
    height: 32,
    backgroundColor: '#2952E3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b', // slate-800
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b', // slate-800
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d4ed8', // .custom-sidebar-profile-avatar-bg
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  profileRole: {
    fontSize: 12,
    color: '#94a3b8',
  },
  logoutBtn: {
    padding: 4,
  }
});
