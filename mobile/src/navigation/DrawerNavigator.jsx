import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity, View, Image, Text } from 'react-native';
import { Menu, ArrowLeft } from 'lucide-react-native';
import CustomDrawerContent from './CustomDrawerContent';

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

// Sales
import SalesEnquiriesScreen from '../screens/sales/SalesEnquiriesScreen';
import SalesEntryScreen from '../screens/sales/SalesEntryScreen';
import CustomerSalesDetailsScreen from '../screens/sales/CustomerSalesDetailsScreen';
import FollowUpScreen from '../screens/sales/FollowUpScreen';

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
    <View style={{ paddingTop: insets.top, backgroundColor: '#F8FAFC' }}>
      {/* Main App Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{ padding: 8, marginLeft: -8, marginRight: 8 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Menu size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 32, height: 32, backgroundColor: '#FFF', borderRadius: 6, overflow: 'hidden' }}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: '100%', height: '100%' }} 
              resizeMode="contain" 
            />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', letterSpacing: 0.5 }}>MADHURA HRMS</Text>
        </View>
      </View>

      {/* Inner Screen Header */}
      {!isDashboard && !['SalesEnquiries', 'SalesEntry', 'CustomerSalesDetails', 'FollowUp', 'ExpenseClaims', 'ExpenseCategories', 'DailyAttendance', 'Regularization', 'Overtime', 'LeaveApplications', 'LeaveApproval', 'LeaveBalance', 'LeaveTypes', 'CompOff', 'ShiftRoster', 'CompanyProfile', 'Departments', 'Designations', 'Teams', 'ShiftManagement', 'HolidayCalendar', 'OrganizationChart', 'EmployeeDirectory', 'EmployeeList', 'AddEmployee', 'EmployeeProfile', 'EmploymentHistory', 'Promotions', 'Transfers', 'ExitManagement', 'EmployeeDocuments'].includes(route.name) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, height: 60, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('DashboardMain')}
            style={{ padding: 8, marginLeft: -8, marginRight: 12 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>{title}</Text>
        </View>
      )}
    </View>
  );
};

export default function DrawerNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Drawer.Navigator
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
      <Drawer.Screen name="HolidayList" component={PlaceholderScreen} />

      {/* Payroll */}
      <Drawer.Screen name="SalaryStructure" component={PlaceholderScreen} />
      <Drawer.Screen name="SalaryComponents" component={PlaceholderScreen} />
      <Drawer.Screen name="PayrollProcessing" component={PlaceholderScreen} />
      <Drawer.Screen name="GeneratePayslips" component={PlaceholderScreen} />
      <Drawer.Screen name="BonusIncentives" component={PlaceholderScreen} />
      <Drawer.Screen name="Reimbursements" component={PlaceholderScreen} />
      <Drawer.Screen name="LoansAdvances" component={PlaceholderScreen} />
      <Drawer.Screen name="TaxManagement" component={PlaceholderScreen} />
      <Drawer.Screen name="PayrollReports" component={PlaceholderScreen} />

      {/* Recruitment */}
      <Drawer.Screen name="RecruitmentDashboard" component={PlaceholderScreen} />
      <Drawer.Screen name="JobOpenings" component={PlaceholderScreen} />
      <Drawer.Screen name="Candidates" component={PlaceholderScreen} />
      <Drawer.Screen name="InterviewSchedule" component={PlaceholderScreen} />
      <Drawer.Screen name="OfferLetters" component={PlaceholderScreen} />
      <Drawer.Screen name="HiringPipeline" component={PlaceholderScreen} />

      {/* Training */}
      <Drawer.Screen name="Training" component={TrainingScreen} />

      {/* Onboarding */}
      <Drawer.Screen name="NewJoiners" component={PlaceholderScreen} />
      <Drawer.Screen name="DocumentVerification" component={PlaceholderScreen} />
      <Drawer.Screen name="AssetAllocation" component={PlaceholderScreen} />
      <Drawer.Screen name="WelcomeKit" component={PlaceholderScreen} />
      <Drawer.Screen name="Orientation" component={PlaceholderScreen} />
      <Drawer.Screen name="Probation" component={PlaceholderScreen} />

      {/* Performance */}
      <Drawer.Screen name="Goals" component={GoalsScreen} />
      <Drawer.Screen name="KPI" component={KPIScreen} />
      <Drawer.Screen name="KRAs" component={KRAsScreen} />
      <Drawer.Screen name="Appraisals" component={AppraisalsScreen} />
      <Drawer.Screen name="Reviews" component={ReviewsScreen} />
      <Drawer.Screen name="Feedback" component={FeedbackScreen} />
      <Drawer.Screen name="PromotionsPerformance" component={PromotionsScreen} />

      {/* Projects */}
      <Drawer.Screen name="ProjectDashboard" component={PlaceholderScreen} />
      <Drawer.Screen name="ProjectsList" component={PlaceholderScreen} />
      <Drawer.Screen name="Tasks" component={TaskBoardScreen} />
      <Drawer.Screen name="TaskBoard" component={TaskBoardScreen} />
      <Drawer.Screen name="SprintBoard" component={PlaceholderScreen} />
      <Drawer.Screen name="Timesheets" component={PlaceholderScreen} />
      <Drawer.Screen name="Milestones" component={PlaceholderScreen} />
      <Drawer.Screen name="TeamMembers" component={PlaceholderScreen} />

      {/* Reports */}
      <Drawer.Screen name="AnalyticsReports" component={AnalyticsReportsScreen} />
      <Drawer.Screen name="EmployeeReports" component={PlaceholderScreen} />
      <Drawer.Screen name="AttendanceReportsModule" component={PlaceholderScreen} />
      <Drawer.Screen name="LeaveReports" component={PlaceholderScreen} />
      <Drawer.Screen name="PayrollReportsModule" component={PlaceholderScreen} />
      <Drawer.Screen name="RecruitmentReports" component={PlaceholderScreen} />
      <Drawer.Screen name="PerformanceReports" component={PlaceholderScreen} />
      <Drawer.Screen name="ProjectReports" component={PlaceholderScreen} />

      {/* Expenses */}
      <Drawer.Screen name="ExpenseClaims" component={ExpenseClaimsScreen} />
      <Drawer.Screen name="ExpenseCategories" component={ExpenseCategoriesScreen} />
      <Drawer.Screen name="ExpenseApproval" component={ExpenseApprovalScreen} />
      <Drawer.Screen name="ExpenseReimbursements" component={ReimbursementsScreen} />
      <Drawer.Screen name="ExpenseReports" component={ExpenseReportsScreen} />

      {/* Documents */}
      <Drawer.Screen name="EmployeeDocumentsModule" component={PlaceholderScreen} />
      <Drawer.Screen name="CompanyDocuments" component={PlaceholderScreen} />
      <Drawer.Screen name="HRPolicies" component={PlaceholderScreen} />
      <Drawer.Screen name="Templates" component={PlaceholderScreen} />
      <Drawer.Screen name="DigitalSignatures" component={PlaceholderScreen} />

      {/* Help Desk */}
      <Drawer.Screen name="HelpDeskDashboard" component={PlaceholderScreen} />
      <Drawer.Screen name="Tickets" component={PlaceholderScreen} />
      <Drawer.Screen name="Categories" component={PlaceholderScreen} />
      <Drawer.Screen name="Priorities" component={PlaceholderScreen} />
      <Drawer.Screen name="KnowledgeBase" component={PlaceholderScreen} />
      <Drawer.Screen name="HelpDeskReports" component={PlaceholderScreen} />

      {/* Settings */}
      <Drawer.Screen name="SettingsCompany" component={PlaceholderScreen} />
      <Drawer.Screen name="SettingsBranding" component={PlaceholderScreen} />
      <Drawer.Screen name="SettingsOrganization" component={PlaceholderScreen} />
      <Drawer.Screen name="SettingsUsers" component={PlaceholderScreen} />
      <Drawer.Screen name="SettingsHR" component={PlaceholderScreen} />
      <Drawer.Screen name="SettingsCommunication" component={PlaceholderScreen} />
      <Drawer.Screen name="SettingsIntegrations" component={PlaceholderScreen} />
      <Drawer.Screen name="SettingsSecurity" component={PlaceholderScreen} />
      <Drawer.Screen name="SettingsSystem" component={PlaceholderScreen} />
      
      {/* Super Admin Missing Screens */}
      <Drawer.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <Drawer.Screen name="SalesEnquiries" component={SalesEnquiriesScreen} />
      <Drawer.Screen name="SalesEntry" component={SalesEntryScreen} />
      <Drawer.Screen name="CustomerSalesDetails" component={CustomerSalesDetailsScreen} />
      <Drawer.Screen name="FollowUp" component={FollowUpScreen} />

      
    </Drawer.Navigator>
  );
}

