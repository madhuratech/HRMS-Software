import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { PermissionGuard } from './components/auth/PermissionGuard';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { StaffDashboard } from './components/dashboard/StaffDashboard';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { SalesEntry } from './components/sales/SalesEntry';
import { SalesEnquiries } from './components/sales/SalesEnquiries';
import { CustomerSalesDetails } from './components/sales/CustomerSalesDetails';
import { TaskBoard } from './components/service/TaskBoard';
import { EmployeeList } from './components/hr/EmployeeList';
import { ShiftScheduler } from './components/hr/ShiftScheduler';
import SalaryStructure from './components/payroll/SalaryStructure';
import SalaryComponents from './components/payroll/SalaryComponents';
import PayrollProcessing from './components/payroll/PayrollProcessing';
import GeneratePayslips from './components/payroll/GeneratePayslips';
import BonusIncentives from './components/payroll/BonusIncentives';
import Reimbursements from './components/payroll/Reimbursements';
import LoansAdvances from './components/payroll/LoansAdvances';
import TaxManagement from './components/payroll/TaxManagement';
import PayrollReports from './components/payroll/PayrollReports';
import { DocumentManager } from './components/hr/DocumentManager';
import { SupportTickets } from './components/support/SupportTickets';
import { NewsFeed } from './components/communication/NewsFeed';
import { EmployeeReports } from './components/reports/EmployeeReports';
import { ReportsDirectory } from './components/reports/ReportsDirectory';
import { AttendanceReports as AttendanceReportsModule } from './components/reports/AttendanceReports';
import { LeaveReports } from './components/reports/LeaveReports';
import { PayrollReports as PayrollReportsModule } from './components/reports/PayrollReports';
import { RecruitmentReports as RecruitmentReportsModule } from './components/reports/RecruitmentReports';
import { PerformanceReports } from './components/reports/PerformanceReports';
import { ProjectReports } from './components/reports/ProjectReports';
import { CompanyProfile } from './components/organization/CompanyProfile';
import { Departments } from './components/organization/Departments';
import { Designations } from './components/organization/Designations';
import { Teams } from './components/organization/Teams';
import { ShiftManagement } from './components/organization/ShiftManagement';
import { HolidayCalendar } from './components/organization/HolidayCalendar';
import { OrganizationChart } from './components/organization/OrganizationChart';
import { UserRoles } from './components/organization/UserRoles';

// Employee Module Imports
import EmployeeDirectory from './components/employee/EmployeeDirectory';
import EmployeeListContent from './components/employee/EmployeeListContent';
import AddEmployeeForm from './components/employee/AddEmployeeForm';
import EmployeeProfileContent from './components/employee/EmployeeProfileContent';
import EmploymentHistory from './components/employee/EmploymentHistory';
import PromotionsContent from './components/employee/PromotionsContent';
import TransfersContent from './components/employee/TransfersContent';
import ExitManagement from './components/employee/ExitManagement';
import EmployeeDocuments from './components/employee/EmployeeDocuments';
import { MyShift } from './components/employee/MyShift';
import { MyPayroll } from './components/employee/MyPayroll';
import { MyTeam } from './components/employee/MyTeam';
import { MyPerformance } from './components/employee/MyPerformance';
import { TeamLeaderDashboard } from './components/dashboard/TeamLeaderDashboard';
import { TeamAttendanceModule } from './components/team-leader/TeamAttendanceModule';
import { TeamTasksModule } from './components/team-leader/TeamTasksModule';
import { TeamLeaveModule } from './components/team-leader/TeamLeaveModule';
import { TeamPerformanceModule } from './components/team-leader/TeamPerformanceModule';
import { AppLayout } from './components/layout/AppLayout';

// Attendance Module Imports
import DailyAttendance from './components/attendance/DailyAttendance';
import GPSAttendance from './components/attendance/GPSAttendance';
import Regularization from './components/attendance/Regularization';
import ShiftRoster from './components/attendance/ShiftRoster';
import Overtime from './components/attendance/Overtime';
import LateArrival from './components/attendance/LateArrival';
import AttendanceReports from './components/attendance/AttendanceReports';
import PunchLocations from './components/attendance/PunchLocations';

// Leave Module Imports
import LeaveDashboard from './components/leave/LeaveDashboard';
import LeaveApplications from './components/leave/LeaveApplications';
import LeaveApproval from './components/leave/LeaveApproval';
import LeaveBalance from './components/leave/LeaveBalance';
import LeaveTypes from './components/leave/LeaveTypes';
import HolidayList from './components/leave/HolidayList';
import CompOff from './components/leave/CompOff';

// Recruitment Module Imports
import RecruitmentDashboard from './components/recruitment/RecruitmentDashboard';
import JobOpenings from './components/recruitment/JobOpenings';
import Candidates from './components/recruitment/Candidates';
import InterviewSchedule from './components/recruitment/InterviewSchedule';
import OfferLetters from './components/recruitment/OfferLetters';
import HiringPipeline from './components/recruitment/HiringPipeline';
import RecruitmentReports from './components/recruitment/RecruitmentReports';

// Onboarding Module Imports
import NewJoiners from './components/onboarding/NewJoiners';
import DocumentVerification from './components/onboarding/DocumentVerification';
import AssetAllocation from './components/onboarding/AssetAllocation';
import WelcomeKit from './components/onboarding/WelcomeKit';
import Orientation from './components/onboarding/Orientation';
import Probation from './components/onboarding/Probation';

// Performance Module Imports
import Goals from './components/performance/Goals';
import KPIs from './components/performance/KPIs';
import KRAs from './components/performance/KRAs';
import Appraisals from './components/performance/Appraisals';
import Reviews from './components/performance/Reviews';
import Feedback from './components/performance/Feedback';
import Promotions from './components/performance/Promotions';

// Project Module Imports
import ProjectDashboard from './components/projects/ProjectDashboard';
import ProjectsList from './components/projects/ProjectsList';
import Tasks from './components/projects/Tasks';
import SprintBoard from './components/projects/SprintBoard';
import Timesheets from './components/projects/Timesheets';
import Milestones from './components/projects/Milestones';
import TeamMembers from './components/projects/TeamMembers';

// Expenses Module Imports
import ExpenseClaims from './components/expenses/ExpenseClaims';
import ExpenseCategories from './components/expenses/ExpenseCategories';
import ExpenseApproval from './components/expenses/ExpenseApproval';
import ReimbursementsModule from './components/expenses/Reimbursements';
import ExpenseReports from './components/expenses/ExpenseReports';

// Documents Module Imports
import EmployeeDocumentsModule from './components/documents/EmployeeDocuments';
import CompanyDocuments from './components/documents/CompanyDocuments';
import HRPolicies from './components/documents/HRPolicies';
import Templates from './components/documents/Templates';
import DigitalSignatures from './components/documents/DigitalSignatures';

// Help Desk Module Imports
import HelpDeskDashboard from './components/helpdesk/HelpDeskDashboard';
import Tickets from './components/helpdesk/Tickets';
import Categories from './components/helpdesk/Categories';
import Priorities from './components/helpdesk/Priorities';
import KnowledgeBase from './components/helpdesk/KnowledgeBase';
import HelpDeskReports from './components/helpdesk/HelpDeskReports';

// Settings Module Imports
import SettingsCompany from './components/settings/SettingsCompany';
import SettingsBranding from './components/settings/SettingsBranding';
import SettingsOrganization from './components/settings/SettingsOrganization';
import SettingsUsers from './components/settings/SettingsUsers';
import SettingsHR from './components/settings/SettingsHR';
import SettingsCommunication from './components/settings/SettingsCommunication';
import SettingsIntegrations from './components/settings/SettingsIntegrations';
import SettingsSecurity from './components/settings/SettingsSecurity';
import SettingsSystem from './components/settings/SettingsSystem';
import { AIAssistantDashboard } from './components/ai-assistant/AIAssistantDashboard';

import { ToastProvider } from './components/ui/Toast';
import { CustomCursor } from './components/ui/CustomCursor';
import { Agentation } from 'agentation';

function App() {
  const [authView, setAuthView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole, setUserRole] = useState('SUPER_ADMIN');
  const [userName, setUserName] = useState('');

  // On mount: restore auth state from localStorage
  React.useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('hrms_auth');
      if (storedAuth) {
        const { role, name, loggedIn } = JSON.parse(storedAuth);
        if (loggedIn && role) {
          setUserRole(role);
          setUserName(name || '');
          setIsLoggedIn(true);
          localStorage.setItem('userRole', role);
          localStorage.setItem('userName', name || '');
        }
      }
    } catch (err) {
      // Corrupted storage — clear it and stay on login
      localStorage.removeItem('hrms_auth');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const handleLogin = (role, name, userObj) => {
    // Use data returned from backend auth — never hardcode employee IDs
    const finalRole = role || (userObj && userObj.role) || 'EMPLOYEE';
    const finalName = name || (userObj && userObj.name) || '';
    const finalId = (userObj && userObj.id) || 1;
    const finalEmail = (userObj && userObj.email) || '';
    const finalToken = (userObj && userObj.token) || 'mock_jwt_token';

    setUserRole(finalRole);
    setUserName(finalName);
    setIsLoggedIn(true);
    localStorage.setItem('userRole', finalRole);
    localStorage.setItem('userName', finalName);

    const authObj = {
      role: finalRole,
      name: finalName,
      loggedIn: true,
      token: finalToken,
      user: {
        id: finalId,
        emp_id: `EMP${String(finalId).padStart(4, '0')}`,
        name: finalName,
        email: finalEmail,
        role: finalRole
      }
    };
    localStorage.setItem('hrms_auth', JSON.stringify(authObj));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setAuthView('login');
    // Clear persisted auth on explicit logout
    localStorage.removeItem('hrms_auth');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
  };

  // Show a full-screen loading spinner while restoring auth state
  if (isInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        gap: 20,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          border: '4px solid rgba(255,255,255,0.15)',
          borderTopColor: '#3b82f6',
          animation: 'spin 0.85s linear infinite',
        }} />
        <p style={{ color: '#94a3b8', fontSize: 15, fontWeight: 500, letterSpacing: '0.02em' }}>
          Loading HRMS…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (authView === 'register' || window.location.pathname.includes('verify-email')) {
      return (
        <Register
          onRegister={handleLogin}
          onLoginClick={() => setAuthView('login')} />);
    }
    return (
      <Login
        onLogin={handleLogin}
        onRegisterClick={() => setAuthView('register')} />);
  }

  // A helper component to bridge the old currentView state with React Router
  const LegacyViewManager = () => {
    const location = useLocation();
    const currentView = location.pathname.substring(1) || 'dashboard'; // remove leading slash

    switch (currentView) {
      case 'dashboard':
        if (userRole === 'SERVICE_STAFF' || userRole === 'SALES_MANAGER') {
          return <StaffDashboard />;
        }
        if (userRole === 'EMPLOYEE') {
          return <EmployeeDashboard />;
        }
        return <SuperAdminDashboard />;
      case 'schedule':
        return <ShiftScheduler />;
      case 'documents':
        return <DocumentManager />;
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">⚙️</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-700">System Settings</h2>
            <p className="text-slate-500 mt-2 max-w-md">Global configuration, role management, and incentive rule settings go here.</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h2 className="text-2xl font-bold text-slate-700">Module Coming Soon</h2>
            <p className="text-slate-500 mt-2">The route {location.pathname} is not yet implemented.</p>
          </div>
        );
    }
  };

  return (
    <ToastProvider>
      <CustomCursor />
      {process.env.NODE_ENV === 'development' && <Agentation />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<AppLayout userRole={userRole} onLogout={handleLogout} />}>
            {/* Dashboard Route */}
            <Route path="/dashboard" element={userRole === 'SERVICE_STAFF' || userRole === 'SALES_MANAGER' ? <StaffDashboard /> : userRole === 'EMPLOYEE' ? <EmployeeDashboard /> : userRole === 'TEAM_LEADER' ? <TeamLeaderDashboard /> : <SuperAdminDashboard />} />

            {/* Dedicated Employee Module Routes */}
            <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/profile" element={<EmployeeProfileContent />} />
            <Route path="/employee/attendance" element={<GPSAttendance />} />
            <Route path="/employee/shift" element={<MyShift />} />
            <Route path="/employee/leave" element={<LeaveApplications />} />
            {/* Employee Payroll & Performance Protected Routes */}
            <Route path="/employee/leave-types" element={<LeaveTypes />} />
            <Route path="/employee/holidays" element={<HolidayList />} />
            <Route path="/employee/payroll" element={<PermissionGuard moduleKey="payroll"><MyPayroll /></PermissionGuard>} />
            <Route path="/employee/tasks" element={<Tasks />} />
            <Route path="/employee/team" element={<MyTeam />} />
            <Route path="/employee/performance" element={<PermissionGuard moduleKey="performance"><MyPerformance /></PermissionGuard>} />
            <Route path="/employee/documents" element={<EmployeeDocuments />} />
            <Route path="/employee/announcements" element={<NewsFeed />} />
            <Route path="/employee/help" element={<SupportTickets />} />

            {/* Dedicated Team Leader Routes */}
            <Route path="/team-leader" element={<Navigate to="/team-leader/dashboard" replace />} />
            <Route path="/team-leader/dashboard" element={<TeamLeaderDashboard />} />
            <Route path="/team-leader/profile" element={<EmployeeProfileContent />} />
            <Route path="/team-leader/my-attendance" element={<GPSAttendance />} />
            <Route path="/team-leader/my-shift" element={<MyShift />} />
            <Route path="/team-leader/my-team" element={<MyTeam />} />
            <Route path="/team-leader/team-attendance" element={<TeamAttendanceModule />} />
            <Route path="/team-leader/projects" element={<ProjectsList />} />
            <Route path="/team-leader/team-tasks" element={<Tasks />} />
            <Route path="/team-leader/team-performance" element={<PermissionGuard moduleKey="performance"><TeamPerformanceModule /></PermissionGuard>} />
            <Route path="/team-leader/my-leave" element={<LeaveApplications />} />
            <Route path="/team-leader/team-leave" element={<TeamLeaveModule />} />
            <Route path="/team-leader/holidays" element={<HolidayList />} />
            <Route path="/team-leader/leave-types" element={<LeaveTypes />} />
            <Route path="/team-leader/my-payroll" element={<PermissionGuard moduleKey="payroll"><MyPayroll /></PermissionGuard>} />
            <Route path="/team-leader/help" element={<SupportTickets />} />

            {/* AI Assistant Route */}
            <Route path="/ai-assistant" element={<PermissionGuard moduleKey="ai_assistant"><AIAssistantDashboard /></PermissionGuard>} />

            {/* Notifications Center Route */}
            <Route path="/notifications" element={<NotificationsPage userRole={userRole} />} />

            {/* Employee Routes - explicitly rendering their own components */}
            <Route path="/employees/dashboard" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<PermissionGuard moduleKey="employees"><EmployeeDirectory /></PermissionGuard>} />
            <Route path="/employees/list" element={<PermissionGuard moduleKey="employees"><EmployeeListContent /></PermissionGuard>} />
            <Route path="/employees/add" element={<PermissionGuard moduleKey="employees"><AddEmployeeForm /></PermissionGuard>} />
            <Route path="/employees/profile" element={<EmployeeProfileContent />} />
            <Route path="/employees/history" element={<PermissionGuard moduleKey="employees"><EmploymentHistory /></PermissionGuard>} />
            <Route path="/employees/promotions" element={<PermissionGuard moduleKey="employees"><PromotionsContent /></PermissionGuard>} />
            <Route path="/employees/transfers" element={<PermissionGuard moduleKey="employees"><TransfersContent /></PermissionGuard>} />
            <Route path="/employees/exit" element={<PermissionGuard moduleKey="employees"><ExitManagement /></PermissionGuard>} />
            <Route path="/employees/documents" element={<PermissionGuard moduleKey="documents"><EmployeeDocuments /></PermissionGuard>} />
            <Route path="/employees/reports" element={<Navigate to="/reports/employees" replace />} />

            {/* Attendance Routes */}
            <Route path="/attendance/daily" element={<PermissionGuard moduleKey="attendance"><DailyAttendance /></PermissionGuard>} />
            <Route path="/attendance/gps" element={<PermissionGuard moduleKey="attendance"><GPSAttendance /></PermissionGuard>} />
            <Route path="/attendance/regularization" element={<PermissionGuard moduleKey="attendance"><Regularization /></PermissionGuard>} />
            <Route path="/attendance/shift-roster" element={<PermissionGuard moduleKey="attendance"><ShiftRoster /></PermissionGuard>} />
            <Route path="/attendance/overtime" element={<PermissionGuard moduleKey="attendance"><Overtime /></PermissionGuard>} />
            <Route path="/attendance/late-arrival" element={<PermissionGuard moduleKey="attendance"><LateArrival /></PermissionGuard>} />
            <Route path="/attendance/reports" element={<Navigate to="/reports/attendance" replace />} />
            <Route path="/attendance/punch-locations" element={<PermissionGuard moduleKey="attendance"><PunchLocations /></PermissionGuard>} />

            {/* Leave Module */}
            <Route path="/leave-dashboard" element={<PermissionGuard moduleKey="leave"><LeaveDashboard /></PermissionGuard>} />
            <Route path="/leave-applications" element={<PermissionGuard moduleKey="leave"><LeaveApplications /></PermissionGuard>} />
            <Route path="/leave-approval" element={<PermissionGuard moduleKey="leave"><LeaveApproval /></PermissionGuard>} />
            <Route path="/leave-balance" element={<PermissionGuard moduleKey="leave"><LeaveBalance /></PermissionGuard>} />
            <Route path="/leave-types" element={<PermissionGuard moduleKey="leave"><LeaveTypes /></PermissionGuard>} />
            <Route path="/leave/reports" element={<Navigate to="/reports/leave" replace />} />
            <Route path="/holiday-list" element={<PermissionGuard moduleKey="leave"><HolidayList /></PermissionGuard>} />
            <Route path="/comp-off" element={<PermissionGuard moduleKey="leave"><CompOff /></PermissionGuard>} />

            {/* Organization Module */}
            <Route path="/company-profile" element={<PermissionGuard moduleKey="organization"><CompanyProfile /></PermissionGuard>} />
            <Route path="/departments" element={<PermissionGuard moduleKey="organization"><Departments /></PermissionGuard>} />
            <Route path="/designations" element={<PermissionGuard moduleKey="organization"><Designations /></PermissionGuard>} />
            <Route path="/teams" element={<PermissionGuard moduleKey="organization"><Teams /></PermissionGuard>} />
            <Route path="/shift-management" element={<PermissionGuard moduleKey="organization"><ShiftManagement /></PermissionGuard>} />
            <Route path="/holiday-calendar" element={<PermissionGuard moduleKey="organization"><HolidayCalendar /></PermissionGuard>} />
            <Route path="/organization-chart" element={<PermissionGuard moduleKey="organization"><OrganizationChart /></PermissionGuard>} />
            <Route path="/user-roles" element={<PermissionGuard moduleKey="user_roles"><UserRoles /></PermissionGuard>} />

            {/* Other Existing Modules */}
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/schedule" element={<ShiftScheduler />} />
            <Route path="/documents" element={<DocumentManager />} />
            <Route path="/support" element={<SupportTickets />} />
            <Route path="/sales" element={<SalesEntry />} />
            <Route path="/leads" element={<SalesEnquiries />} />
            <Route path="/customer-sales" element={<CustomerSalesDetails />} />
            <Route path="/service" element={<TaskBoard />} />
            {/* Global Centralized Reports Module */}
            <Route path="/reports" element={<ReportsDirectory />} />
            <Route path="/reports/employees" element={<EmployeeReports />} />
            <Route path="/reports/employee" element={<EmployeeReports />} />
            <Route path="/reports/attendance" element={<AttendanceReportsModule />} />
            <Route path="/reports/leave" element={<LeaveReports />} />
            <Route path="/reports/payroll" element={<PayrollReportsModule />} />
            <Route path="/reports/recruitment" element={<RecruitmentReportsModule />} />
            <Route path="/reports/performance" element={<PerformanceReports />} />
            <Route path="/reports/projects" element={<ProjectReports />} />
            <Route path="/reports/project" element={<ProjectReports />} />

            {/* Payroll Module */}
            <Route path="/payroll" element={<Navigate to="/payroll/salary-structure" replace />} />
            <Route path="/payroll/salary-structure" element={<PermissionGuard moduleKey="payroll"><SalaryStructure /></PermissionGuard>} />
            <Route path="/payroll/components" element={<PermissionGuard moduleKey="payroll"><SalaryComponents /></PermissionGuard>} />
            <Route path="/payroll/processing" element={<PermissionGuard moduleKey="payroll"><PayrollProcessing /></PermissionGuard>} />
            <Route path="/payroll/payslips" element={<PermissionGuard moduleKey="payroll"><GeneratePayslips /></PermissionGuard>} />
            <Route path="/payroll/bonus" element={<PermissionGuard moduleKey="payroll"><BonusIncentives /></PermissionGuard>} />
            <Route path="/payroll/reimbursements" element={<PermissionGuard moduleKey="payroll"><Reimbursements /></PermissionGuard>} />
            <Route path="/payroll/loans" element={<PermissionGuard moduleKey="payroll"><LoansAdvances /></PermissionGuard>} />
            <Route path="/payroll/tax" element={<PermissionGuard moduleKey="payroll"><TaxManagement /></PermissionGuard>} />
            <Route path="/payroll/reports" element={<Navigate to="/reports/payroll" replace />} />

            {/* Recruitment Module */}
            <Route path="/recruitment" element={<Navigate to="/recruitment/dashboard" replace />} />
            <Route path="/recruitment/dashboard" element={<PermissionGuard moduleKey="recruitment"><RecruitmentDashboard /></PermissionGuard>} />
            <Route path="/recruitment/jobs" element={<PermissionGuard moduleKey="recruitment"><JobOpenings /></PermissionGuard>} />
            <Route path="/recruitment/candidates" element={<PermissionGuard moduleKey="recruitment"><Candidates /></PermissionGuard>} />
            <Route path="/recruitment/interviews" element={<PermissionGuard moduleKey="recruitment"><InterviewSchedule /></PermissionGuard>} />
            <Route path="/recruitment/offers" element={<PermissionGuard moduleKey="recruitment"><OfferLetters /></PermissionGuard>} />
            <Route path="/recruitment/pipeline" element={<PermissionGuard moduleKey="recruitment"><HiringPipeline /></PermissionGuard>} />
            <Route path="/recruitment/reports" element={<Navigate to="/reports/recruitment" replace />} />

            {/* Onboarding Module */}
            <Route path="/onboarding" element={<Navigate to="/onboarding/new-joiners" replace />} />
            <Route path="/onboarding/new-joiners" element={<PermissionGuard moduleKey="onboarding"><NewJoiners /></PermissionGuard>} />
            <Route path="/onboarding/documents" element={<PermissionGuard moduleKey="onboarding"><DocumentVerification /></PermissionGuard>} />
            <Route path="/onboarding/assets" element={<PermissionGuard moduleKey="onboarding"><AssetAllocation /></PermissionGuard>} />
            <Route path="/onboarding/welcome-kit" element={<PermissionGuard moduleKey="onboarding"><WelcomeKit /></PermissionGuard>} />
            <Route path="/onboarding/orientation" element={<PermissionGuard moduleKey="onboarding"><Orientation /></PermissionGuard>} />
            <Route path="/onboarding/probation" element={<PermissionGuard moduleKey="onboarding"><Probation /></PermissionGuard>} />

            {/* Performance Module */}
            <Route path="/performance" element={<Navigate to="/performance/goals" replace />} />
            <Route path="/performance/goals" element={<PermissionGuard moduleKey="performance"><Goals /></PermissionGuard>} />
            <Route path="/performance/kpis" element={<PermissionGuard moduleKey="performance"><KPIs /></PermissionGuard>} />
            <Route path="/performance/kras" element={<PermissionGuard moduleKey="performance"><KRAs /></PermissionGuard>} />
            <Route path="/performance/appraisals" element={<PermissionGuard moduleKey="performance"><Appraisals /></PermissionGuard>} />
            <Route path="/performance/reviews" element={<PermissionGuard moduleKey="performance"><Reviews /></PermissionGuard>} />
            <Route path="/performance/feedback" element={<PermissionGuard moduleKey="performance"><Feedback /></PermissionGuard>} />
            <Route path="/performance/promotions" element={<PermissionGuard moduleKey="performance"><Promotions /></PermissionGuard>} />
            <Route path="/performance/reports" element={<Navigate to="/reports/performance" replace />} />

            {/* Project Management Module */}
            <Route path="/projects" element={<Navigate to="/projects/dashboard" replace />} />
            <Route path="/projects/dashboard" element={<PermissionGuard moduleKey="projects"><ProjectDashboard /></PermissionGuard>} />
            <Route path="/projects/list" element={<PermissionGuard moduleKey="projects"><ProjectsList /></PermissionGuard>} />
            <Route path="/projects/tasks" element={<PermissionGuard moduleKey="projects"><Tasks /></PermissionGuard>} />
            <Route path="/projects/sprint-board" element={<PermissionGuard moduleKey="projects"><SprintBoard /></PermissionGuard>} />
            <Route path="/projects/timesheets" element={<PermissionGuard moduleKey="projects"><Timesheets /></PermissionGuard>} />
            <Route path="/projects/milestones" element={<PermissionGuard moduleKey="projects"><Milestones /></PermissionGuard>} />
            <Route path="/projects/team" element={<PermissionGuard moduleKey="projects"><TeamMembers /></PermissionGuard>} />
            <Route path="/projects/reports" element={<Navigate to="/reports/projects" replace />} />

            {/* Expenses Module */}
            <Route path="/expenses" element={<Navigate to="/expenses/claims" replace />} />
            <Route path="/expenses/claims" element={<PermissionGuard moduleKey="expenses"><ExpenseClaims /></PermissionGuard>} />
            <Route path="/expenses/categories" element={<PermissionGuard moduleKey="expenses"><ExpenseCategories /></PermissionGuard>} />
            <Route path="/expenses/approval" element={<PermissionGuard moduleKey="expenses"><ExpenseApproval /></PermissionGuard>} />
            <Route path="/expenses/reimbursements" element={<PermissionGuard moduleKey="expenses"><ReimbursementsModule /></PermissionGuard>} />
            <Route path="/expenses/reports" element={<Navigate to="/reports/expenses" replace />} />

            {/* Documents Module */}
            <Route path="/documents" element={<Navigate to="/documents/employee" replace />} />
            <Route path="/documents/employee" element={<PermissionGuard moduleKey="documents"><EmployeeDocumentsModule /></PermissionGuard>} />
            <Route path="/documents/company" element={<PermissionGuard moduleKey="documents"><CompanyDocuments /></PermissionGuard>} />
            <Route path="/documents/policies" element={<PermissionGuard moduleKey="documents"><HRPolicies /></PermissionGuard>} />
            <Route path="/documents/templates" element={<PermissionGuard moduleKey="documents"><Templates /></PermissionGuard>} />
            <Route path="/documents/signatures" element={<PermissionGuard moduleKey="documents"><DigitalSignatures /></PermissionGuard>} />

            {/* Help Desk Module */}
            <Route path="/help-desk" element={<Navigate to="/help-desk/dashboard" replace />} />
            <Route path="/help-desk/dashboard" element={<PermissionGuard moduleKey="helpdesk"><HelpDeskDashboard /></PermissionGuard>} />
            <Route path="/help-desk/tickets" element={<PermissionGuard moduleKey="helpdesk"><Tickets /></PermissionGuard>} />
            <Route path="/help-desk/categories" element={<PermissionGuard moduleKey="helpdesk"><Categories /></PermissionGuard>} />
            <Route path="/help-desk/priorities" element={<PermissionGuard moduleKey="helpdesk"><Priorities /></PermissionGuard>} />
            <Route path="/help-desk/knowledge-base" element={<PermissionGuard moduleKey="helpdesk"><KnowledgeBase /></PermissionGuard>} />
            <Route path="/help-desk/reports" element={<PermissionGuard moduleKey="helpdesk"><HelpDeskReports /></PermissionGuard>} />

            {/* Settings Module */}
            <Route path="/settings" element={<Navigate to="/settings/company" replace />} />
            <Route path="/settings/company" element={<PermissionGuard moduleKey="settings"><SettingsCompany /></PermissionGuard>} />
            <Route path="/settings/branding" element={<PermissionGuard moduleKey="settings"><SettingsBranding /></PermissionGuard>} />
            <Route path="/settings/organization" element={<PermissionGuard moduleKey="settings"><SettingsOrganization /></PermissionGuard>} />
            <Route path="/settings/users" element={<PermissionGuard moduleKey="user_roles"><UserRoles /></PermissionGuard>} />
            <Route path="/settings/hr" element={<PermissionGuard moduleKey="settings"><SettingsHR /></PermissionGuard>} />
            <Route path="/settings/communication" element={<SettingsCommunication />} />
            <Route path="/settings/integrations" element={<SettingsIntegrations />} />
            <Route path="/settings/security" element={<SettingsSecurity />} />
            <Route path="/settings/system" element={<SettingsSystem />} />

            {/* Fallback for all other routes */}
            <Route path="*" element={<LegacyViewManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );

}

export default App;