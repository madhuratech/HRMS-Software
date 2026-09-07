import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity, View, Image, Text } from 'react-native';
import { Menu, ArrowLeft } from 'lucide-react-native';
import CustomDrawerContent from './CustomDrawerContent';
import { useAuth } from '../context/AuthContext';

// Existing Screens
import DashboardMainWrapper from '../screens/dashboard/DashboardMain';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import LeaveScreen from '../screens/leave/LeaveScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

// --- NEW MODULE SCREENS ---
import TrainingScreen from '../screens/training/TrainingScreen';
import AnalyticsReportsScreen from '../screens/reports/AnalyticsReportsScreen';
import GoalsScreen from '../screens/performance/GoalsScreen';
import KPIScreen from '../screens/performance/KPIScreen';
import KRAsScreen from '../screens/performance/KRAsScreen';
import AppraisalsScreen from '../screens/performance/AppraisalsScreen';
import ReviewsScreen from '../screens/performance/ReviewsScreen';
import FeedbackScreen from '../screens/performance/FeedbackScreen';
import EmployeeDashboardScreen from '../screens/dashboard/EmployeeDashboardScreen';

// Expenses Screens
import ExpenseCategoriesScreen from '../screens/expenses/ExpenseCategoriesScreen';
import ExpenseClaimsScreen from '../screens/expenses/ExpenseClaimsScreen';
import ExpenseApprovalScreen from '../screens/expenses/ExpenseApprovalScreen';
import ReimbursementsScreen from '../screens/expenses/ReimbursementsScreen';
import ExpenseReportsScreen from '../screens/expenses/ExpenseReportsScreen';

// Phase 1: Payroll Screens
import SalaryStructureScreen from '../screens/payroll/SalaryStructureScreen';
import SalaryComponentsScreen from '../screens/payroll/SalaryComponentsScreen';
import PayrollProcessingScreen from '../screens/payroll/PayrollProcessingScreen';
import GeneratePayslipsScreen from '../screens/payroll/GeneratePayslipsScreen';
import BonusIncentivesScreen from '../screens/payroll/BonusIncentivesScreen';
import LoansAdvancesScreen from '../screens/payroll/LoansAdvancesScreen';
import TaxManagementScreen from '../screens/payroll/TaxManagementScreen';

// Phase 1: Recruitment Screens
import RecruitmentDashboardScreen from '../screens/recruitment/RecruitmentDashboardScreen';
import JobOpeningsScreen from '../screens/recruitment/JobOpeningsScreen';
import CandidatesScreen from '../screens/recruitment/CandidatesScreen';
import InterviewScheduleScreen from '../screens/recruitment/InterviewScheduleScreen';
import OfferLettersScreen from '../screens/recruitment/OfferLettersScreen';
import HiringPipelineScreen from '../screens/recruitment/HiringPipelineScreen';

// Phase 4.2: Onboarding Screens
import NewJoinersScreen from '../screens/onboarding/NewJoinersScreen';
import DocumentVerificationScreen from '../screens/onboarding/DocumentVerificationScreen';
import AssetAllocationScreen from '../screens/onboarding/AssetAllocationScreen';
import WelcomeKitScreen from '../screens/onboarding/WelcomeKitScreen';
import OrientationScreen from '../screens/onboarding/OrientationScreen';
import ProbationScreen from '../screens/onboarding/ProbationScreen';


// Attendance Screens
import DailyAttendanceScreen from '../screens/attendance/DailyAttendanceScreen';
import RegularizationScreen from '../screens/attendance/RegularizationScreen';
import ShiftRosterScreen from '../screens/attendance/ShiftRosterScreen';
import OvertimeScreen from '../screens/attendance/OvertimeScreen';
import LateArrivalScreen from '../screens/attendance/LateArrivalScreen';
import AttendanceReportsScreen from '../screens/attendance/AttendanceReportsScreen';

// Leave Screens
import LeaveApplicationsScreen from '../screens/leave/LeaveApplicationsScreen';
import LeaveApprovalScreen from '../screens/leave/LeaveApprovalScreen';
import LeaveBalanceScreen from '../screens/leave/LeaveBalanceScreen';
import LeaveTypesScreen from '../screens/leave/LeaveTypesScreen';
import CompOffScreen from '../screens/leave/CompOffScreen';

// Organization Screens
import CompanyProfileScreen from '../screens/organization/CompanyProfileScreen';
import DepartmentsScreen from '../screens/organization/DepartmentsScreen';
import DesignationsScreen from '../screens/organization/DesignationsScreen';
import TeamsScreen from '../screens/organization/TeamsScreen';
import ShiftManagementScreen from '../screens/organization/ShiftManagementScreen';
import HolidayCalendarScreen from '../screens/organization/HolidayCalendarScreen';
import OrganizationChartScreen from '../screens/organization/OrganizationChartScreen';
import UserRolesScreen from '../screens/organization/UserRolesScreen';

// Employee Screens
import EmployeeDirectoryScreen from '../screens/employee/EmployeeDirectoryScreen';
import AddEmployeeScreen from '../screens/employee/AddEmployeeScreen';
import EmployeeProfileScreen from '../screens/employee/EmployeeProfileScreen';
import EmployeeListScreen from '../screens/employee/EmployeeListScreen';
import EmploymentHistoryScreen from '../screens/employee/EmploymentHistoryScreen';
import PromotionsScreen from '../screens/employee/PromotionsScreen';
import TransfersScreen from '../screens/employee/TransfersScreen';
import ExitManagementScreen from '../screens/employee/ExitManagementScreen';
import EmployeeDocumentsScreen from '../screens/employee/EmployeeDocumentsScreen';

// Projects & Tasks
import TaskBoardScreen from '../screens/tasks/TaskBoardScreen';
import TaskDetailsScreen from '../screens/tasks/TaskDetailsScreen';
import TimesheetsScreen from '../screens/projects/TimesheetsScreen';
import ProjectDashboardScreen from '../screens/projects/ProjectDashboardScreen';
import ProjectsListScreen from '../screens/projects/ProjectsListScreen';
import SprintBoardScreen from '../screens/projects/SprintBoardScreen';
import MilestonesScreen from '../screens/projects/MilestonesScreen';
import TeamMembersScreen from '../screens/projects/TeamMembersScreen';

// Sales
import SalesEnquiriesScreen from '../screens/sales/SalesEnquiriesScreen';
import SalesEntryScreen from '../screens/sales/SalesEntryScreen';
import CustomerSalesDetailsScreen from '../screens/sales/CustomerSalesDetailsScreen';
import FollowUpScreen from '../screens/sales/FollowUpScreen';


// Phase 4 New Screens
import HolidayListScreen from '../screens/leave/HolidayListScreen';
import PayrollReportsScreen from '../screens/payroll/PayrollReportsScreen';

// Documents
import EmployeeDocumentsModuleScreen from '../screens/documents/EmployeeDocumentsModuleScreen';
import CompanyDocumentsScreen from '../screens/documents/CompanyDocumentsScreen';
import HRPoliciesScreen from '../screens/documents/HRPoliciesScreen';
import TemplatesScreen from '../screens/documents/TemplatesScreen';
import DigitalSignaturesScreen from '../screens/documents/DigitalSignaturesScreen';

// Help Desk
import HelpDeskDashboardScreen from '../screens/helpdesk/HelpDeskDashboardScreen';
import TicketsScreen from '../screens/helpdesk/TicketsScreen';
import CategoriesScreen from '../screens/helpdesk/CategoriesScreen';
import PrioritiesScreen from '../screens/helpdesk/PrioritiesScreen';
import KnowledgeBaseScreen from '../screens/helpdesk/KnowledgeBaseScreen';
import HelpDeskReportsScreen from '../screens/helpdesk/HelpDeskReportsScreen';

// Settings
import SettingsCompanyScreen from '../screens/settings/SettingsCompanyScreen';
import SettingsBrandingScreen from '../screens/settings/SettingsBrandingScreen';
import SettingsOrganizationScreen from '../screens/settings/SettingsOrganizationScreen';
import SettingsUsersScreen from '../screens/settings/SettingsUsersScreen';
import SettingsHRScreen from '../screens/settings/SettingsHRScreen';
import SettingsCommunicationScreen from '../screens/settings/SettingsCommunicationScreen';
import SettingsIntegrationsScreen from '../screens/settings/SettingsIntegrationsScreen';
import SettingsSecurityScreen from '../screens/settings/SettingsSecurityScreen';
import SettingsSystemScreen from '../screens/settings/SettingsSystemScreen';

// AI Assistant
import AIAssistantScreen from '../screens/ai/AIAssistantScreen';

// Reports
import EmployeeReportsScreen from '../screens/reports/EmployeeReportsScreen';
import AttendanceReportsModuleScreen from '../screens/reports/AttendanceReportsModuleScreen';
import LeaveReportsScreen from '../screens/reports/LeaveReportsScreen';
import PayrollReportsModuleScreen from '../screens/reports/PayrollReportsModuleScreen';
import RecruitmentReportsScreen from '../screens/reports/RecruitmentReportsScreen';
import PerformanceReportsScreen from '../screens/reports/PerformanceReportsScreen';
import ProjectReportsScreen from '../screens/reports/ProjectReportsScreen';

const Drawer = createDrawerNavigator();

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomHeader = ({ navigation, route, insets }) => {
  const titles = {
    DashboardMain: 'Dashboard',
    EmployeeDashboard: 'Employee Dashboard',
    AttendanceMain: 'Attendance',
    LeaveMain: 'Leave Management',
    EmployeeList: 'Employees',
    AttendanceReportsModule: 'Attendance Reports',
    PayrollReportsModule: 'Payroll Reports',
    EmployeeDocumentsModule: 'Employee Documents',
    KPI: 'KPI',
    KRAs: 'KRAs',
  };
  const title = titles[route.name] || route.name.replace(/([A-Z])/g, ' $1').trim();
  const isDashboard = route.name === 'DashboardMain' || route.name === 'EmployeeDashboard';

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: '#FFFFFF' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{ padding: 8, marginLeft: -8, marginRight: 16 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Menu size={24} color="#0F172A" />
        </TouchableOpacity>
        
        {isDashboard ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 32, height: 32, backgroundColor: '#EFF6FF', borderRadius: 6, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={{ width: 24, height: 24 }} 
                resizeMode="contain" 
              />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', letterSpacing: 0.5 }}>HAWKEYE NEST</Text>
              <Text style={{ fontSize: 9, color: '#2563EB', fontWeight: '700', letterSpacing: 1.2 }}>HRMS</Text>
            </View>
          </View>
        ) : (
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>{title}</Text>
        )}
      </View>
    </View>
  );
};

export default function DrawerNavigator() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const roleStr = String(user?.role || user?.type || '').toUpperCase();
  const isEmployee = roleStr === 'EMPLOYEE' || roleStr === 'STAFF';
  const isTeamLeader = roleStr === 'TEAM_LEADER' || roleStr === 'TEAM LEADER';
  
  return (
    <Drawer.Navigator
      initialRouteName={isEmployee || isTeamLeader ? 'EmployeeDashboard' : 'DashboardMain'}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation, route }) => ({
        drawerStyle: { width: 250 },
        header: () => <CustomHeader navigation={navigation} route={route} insets={insets} />,
      })}
    >
      <Drawer.Screen name="DashboardMain" component={DashboardMainWrapper} />
      <Drawer.Screen name="EmployeeDashboard" component={EmployeeDashboardScreen} />
      
      {/* Organization */}
      <Drawer.Screen name="CompanyProfile" component={CompanyProfileScreen} />
      <Drawer.Screen name="Departments" component={DepartmentsScreen} />
      <Drawer.Screen name="Designations" component={DesignationsScreen} />
      <Drawer.Screen name="Teams" component={TeamsScreen} />
      <Drawer.Screen name="ShiftManagement" component={ShiftManagementScreen} />
      <Drawer.Screen name="HolidayCalendar" component={HolidayCalendarScreen} />
      <Drawer.Screen name="OrganizationChart" component={OrganizationChartScreen} />
      <Drawer.Screen name="UserRoles" component={UserRolesScreen} />

      {/* Employees */}
      <Drawer.Screen name="EmployeeDirectory" component={EmployeeDirectoryScreen} />
      <Drawer.Screen name="EmployeeList" component={EmployeeListScreen} />
      <Drawer.Screen name="AddEmployee" component={AddEmployeeScreen} />
      <Drawer.Screen name="EmployeeProfile" component={EmployeeProfileScreen} />
      <Drawer.Screen name="EmploymentHistory" component={EmploymentHistoryScreen} />
      <Drawer.Screen name="Promotions" component={PromotionsScreen} />
      <Drawer.Screen name="Transfers" component={TransfersScreen} />
      <Drawer.Screen name="ExitManagement" component={ExitManagementScreen} />
      <Drawer.Screen name="EmployeeDocuments" component={EmployeeDocumentsScreen} />

      {/* Attendance */}
      <Drawer.Screen name="DailyAttendance" component={DailyAttendanceScreen} />
      <Drawer.Screen name="AttendanceMain" component={AttendanceScreen} />
      <Drawer.Screen name="Regularization" component={RegularizationScreen} />
      <Drawer.Screen name="ShiftRoster" component={ShiftRosterScreen} />
      <Drawer.Screen name="Overtime" component={OvertimeScreen} />
      <Drawer.Screen name="LateArrival" component={LateArrivalScreen} />
      <Drawer.Screen name="AttendanceReports" component={AttendanceReportsScreen} />

      {/* Leave Management */}
      <Drawer.Screen name="LeaveMain" component={LeaveScreen} />
      <Drawer.Screen name="LeaveApplications" component={LeaveApplicationsScreen} />
      <Drawer.Screen name="LeaveApproval" component={LeaveApprovalScreen} />
      <Drawer.Screen name="LeaveBalance" component={LeaveBalanceScreen} />
      <Drawer.Screen name="LeaveTypes" component={LeaveTypesScreen} />
      <Drawer.Screen name="CompOff" component={CompOffScreen} />
      <Drawer.Screen name="HolidayList" component={HolidayListScreen} />

      {/* Payroll */}
      <Drawer.Screen name="SalaryStructure" component={SalaryStructureScreen} />
      <Drawer.Screen name="SalaryComponents" component={SalaryComponentsScreen} />
      <Drawer.Screen name="PayrollProcessing" component={PayrollProcessingScreen} />
      <Drawer.Screen name="GeneratePayslips" component={GeneratePayslipsScreen} />
      <Drawer.Screen name="BonusIncentives" component={BonusIncentivesScreen} />
      <Drawer.Screen name="Reimbursements" component={ReimbursementsScreen} />
      <Drawer.Screen name="LoansAdvances" component={LoansAdvancesScreen} />
      <Drawer.Screen name="TaxManagement" component={TaxManagementScreen} />
      <Drawer.Screen name="PayrollReports" component={PayrollReportsScreen} />

      {/* Recruitment */}
      <Drawer.Screen name="RecruitmentDashboard" component={RecruitmentDashboardScreen} />
      <Drawer.Screen name="JobOpenings" component={JobOpeningsScreen} />
      <Drawer.Screen name="Candidates" component={CandidatesScreen} />
      <Drawer.Screen name="InterviewSchedule" component={InterviewScheduleScreen} />
      <Drawer.Screen name="OfferLetters" component={OfferLettersScreen} />
      <Drawer.Screen name="HiringPipeline" component={HiringPipelineScreen} />

      {/* Training */}
      <Drawer.Screen name="Training" component={TrainingScreen} />

      {/* Onboarding */}
      <Drawer.Screen name="NewJoiners" component={NewJoinersScreen} />
      <Drawer.Screen name="DocumentVerification" component={DocumentVerificationScreen} />
      <Drawer.Screen name="AssetAllocation" component={AssetAllocationScreen} />
      <Drawer.Screen name="WelcomeKit" component={WelcomeKitScreen} />
      <Drawer.Screen name="Orientation" component={OrientationScreen} />
      <Drawer.Screen name="Probation" component={ProbationScreen} />

      {/* Performance */}
      <Drawer.Screen name="Goals" component={GoalsScreen} />
      <Drawer.Screen name="KPI" component={KPIScreen} />
      <Drawer.Screen name="KRAs" component={KRAsScreen} />
      <Drawer.Screen name="Appraisals" component={AppraisalsScreen} />
      <Drawer.Screen name="Reviews" component={ReviewsScreen} />
      <Drawer.Screen name="Feedback" component={FeedbackScreen} />
      <Drawer.Screen name="PromotionsPerformance" component={PromotionsScreen} />

      {/* Projects */}
      <Drawer.Screen name="ProjectDashboard" component={ProjectDashboardScreen} />
      <Drawer.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Drawer.Screen name="Tasks" component={TaskBoardScreen} />
      <Drawer.Screen name="SprintBoard" component={SprintBoardScreen} />
      <Drawer.Screen name="Timesheets" component={TimesheetsScreen} />
      <Drawer.Screen name="Milestones" component={MilestonesScreen} />
      <Drawer.Screen name="TeamMembers" component={TeamMembersScreen} />

      {/* Reports */}
      <Drawer.Screen name="AnalyticsReports" component={AnalyticsReportsScreen} />
      <Drawer.Screen name="EmployeeReports" component={EmployeeReportsScreen} />
      <Drawer.Screen name="AttendanceReportsModule" component={AttendanceReportsModuleScreen} />
      <Drawer.Screen name="LeaveReports" component={LeaveReportsScreen} />
      <Drawer.Screen name="PayrollReportsModule" component={PayrollReportsModuleScreen} />
      <Drawer.Screen name="RecruitmentReports" component={RecruitmentReportsScreen} />
      <Drawer.Screen name="PerformanceReports" component={PerformanceReportsScreen} />
      <Drawer.Screen name="ProjectReports" component={ProjectReportsScreen} />

      {/* Expenses */}
      <Drawer.Screen name="ExpenseClaims" component={ExpenseClaimsScreen} />
      <Drawer.Screen name="ExpenseCategories" component={ExpenseCategoriesScreen} />
      <Drawer.Screen name="ExpenseApproval" component={ExpenseApprovalScreen} />
      <Drawer.Screen name="ExpenseReimbursements" component={ReimbursementsScreen} />
      <Drawer.Screen name="ExpenseReports" component={ExpenseReportsScreen} />

      {/* Documents */}
      <Drawer.Screen name="EmployeeDocumentsModule" component={EmployeeDocumentsModuleScreen} />
      <Drawer.Screen name="CompanyDocuments" component={CompanyDocumentsScreen} />
      <Drawer.Screen name="HRPolicies" component={HRPoliciesScreen} />
      <Drawer.Screen name="Templates" component={TemplatesScreen} />
      <Drawer.Screen name="DigitalSignatures" component={DigitalSignaturesScreen} />

      {/* Help Desk */}
      <Drawer.Screen name="HelpDeskDashboard" component={HelpDeskDashboardScreen} />
      <Drawer.Screen name="Tickets" component={TicketsScreen} />
      <Drawer.Screen name="Categories" component={CategoriesScreen} />
      <Drawer.Screen name="Priorities" component={PrioritiesScreen} />
      <Drawer.Screen name="KnowledgeBase" component={KnowledgeBaseScreen} />
      <Drawer.Screen name="HelpDeskReports" component={HelpDeskReportsScreen} />

      {/* Settings */}
      <Drawer.Screen name="SettingsCompany" component={SettingsCompanyScreen} />
      <Drawer.Screen name="SettingsBranding" component={SettingsBrandingScreen} />
      <Drawer.Screen name="SettingsOrganization" component={SettingsOrganizationScreen} />
      <Drawer.Screen name="SettingsUsers" component={SettingsUsersScreen} />
      <Drawer.Screen name="SettingsHR" component={SettingsHRScreen} />
      <Drawer.Screen name="SettingsCommunication" component={SettingsCommunicationScreen} />
      <Drawer.Screen name="SettingsIntegrations" component={SettingsIntegrationsScreen} />
      <Drawer.Screen name="SettingsSecurity" component={SettingsSecurityScreen} />
      <Drawer.Screen name="SettingsSystem" component={SettingsSystemScreen} />
      
      {/* AI Assistant */}
      <Drawer.Screen name="AIAssistant" component={AIAssistantScreen} />
      
      {/* Super Admin Missing Screens */}
      <Drawer.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <Drawer.Screen name="SalesEnquiries" component={SalesEnquiriesScreen} />
      <Drawer.Screen name="SalesEntry" component={SalesEntryScreen} />
      <Drawer.Screen name="CustomerSalesDetails" component={CustomerSalesDetailsScreen} />
      <Drawer.Screen name="FollowUp" component={FollowUpScreen} />

      
    </Drawer.Navigator>
  );
}

