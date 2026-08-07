import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { StaffDashboard } from './components/dashboard/StaffDashboard';
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
import { AppLayout } from './components/layout/AppLayout';

// Attendance Module Imports
import DailyAttendance from './components/attendance/DailyAttendance';
import GPSAttendance from './components/attendance/GPSAttendance';
import Regularization from './components/attendance/Regularization';
import ShiftRoster from './components/attendance/ShiftRoster';
import Overtime from './components/attendance/Overtime';
import LateArrival from './components/attendance/LateArrival';
import AttendanceReports from './components/attendance/AttendanceReports';

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
        }
      }
    } catch (err) {
      // Corrupted storage — clear it and stay on login
      localStorage.removeItem('hrms_auth');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const handleLogin = (role, name) => {
    setUserRole(role);
    setUserName(name || '');
    setIsLoggedIn(true);
    // Persist auth to localStorage so refresh doesn't log out the user
    localStorage.setItem('hrms_auth', JSON.stringify({ role, name, loggedIn: true }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setAuthView('login');
    // Clear persisted auth on explicit logout
    localStorage.removeItem('hrms_auth');
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
    if (authView === 'register') {
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
            <Route path="/dashboard" element={userRole === 'SERVICE_STAFF' || userRole === 'SALES_MANAGER' ? <StaffDashboard /> : <SuperAdminDashboard />} />

            {/* Employee Routes - explicitly rendering their own components */}
            <Route path="/employees/dashboard" element={<StaffDashboard />} />
            <Route path="/employees" element={<EmployeeDirectory />} />
            <Route path="/employees/list" element={<EmployeeListContent />} />
            <Route path="/employees/add" element={<AddEmployeeForm />} />
            <Route path="/employees/profile" element={<EmployeeProfileContent />} />
            <Route path="/employees/history" element={<EmploymentHistory />} />
            <Route path="/employees/promotions" element={<PromotionsContent />} />
            <Route path="/employees/transfers" element={<TransfersContent />} />
            <Route path="/employees/exit" element={<ExitManagement />} />
            <Route path="/employees/documents" element={<EmployeeDocuments />} />
            
            {/* Attendance Routes */}
            <Route path="/attendance/daily" element={<DailyAttendance />} />
            <Route path="/attendance/gps" element={<GPSAttendance />} />
            <Route path="/attendance/regularization" element={<Regularization />} />
            <Route path="/attendance/shift-roster" element={<ShiftRoster />} />
            <Route path="/attendance/overtime" element={<Overtime />} />
            <Route path="/attendance/late-arrival" element={<LateArrival />} />
            <Route path="/attendance/reports" element={<AttendanceReports />} />
            
            {/* Leave Module */}
            <Route path="/leave-dashboard" element={<LeaveDashboard />} />
            <Route path="/leave-applications" element={<LeaveApplications />} />
            <Route path="/leave-approval" element={<LeaveApproval />} />
            <Route path="/leave-balance" element={<LeaveBalance />} />
            <Route path="/leave-types" element={<LeaveTypes />} />
            <Route path="/holiday-list" element={<HolidayList />} />
            <Route path="/comp-off" element={<CompOff />} />
            
            {/* Organization Module */}
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/designations" element={<Designations />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/shift-management" element={<ShiftManagement />} />
            <Route path="/holiday-calendar" element={<HolidayCalendar />} />
            <Route path="/organization-chart" element={<OrganizationChart />} />
            
            {/* Other Existing Modules */}
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/schedule" element={<ShiftScheduler />} />
            <Route path="/documents" element={<DocumentManager />} />
            <Route path="/support" element={<SupportTickets />} />
            <Route path="/sales" element={<SalesEntry />} />
            <Route path="/leads" element={<SalesEnquiries />} />
            <Route path="/customer-sales" element={<CustomerSalesDetails />} />
            <Route path="/service" element={<TaskBoard />} />
            <Route path="/reports" element={<Navigate to="/reports/employee" replace />} />
            <Route path="/reports/employee" element={<EmployeeReports />} />
            <Route path="/reports/attendance" element={<AttendanceReportsModule />} />
            <Route path="/reports/leave" element={<LeaveReports />} />
            <Route path="/reports/payroll" element={<PayrollReportsModule />} />
            <Route path="/reports/recruitment" element={<RecruitmentReportsModule />} />
            <Route path="/reports/performance" element={<PerformanceReports />} />
            <Route path="/reports/project" element={<ProjectReports />} />
            
            {/* Payroll Module */}
            <Route path="/payroll" element={<Navigate to="/payroll/salary-structure" replace />} />
            <Route path="/payroll/salary-structure" element={<SalaryStructure />} />
            <Route path="/payroll/components" element={<SalaryComponents />} />
            <Route path="/payroll/processing" element={<PayrollProcessing />} />
            <Route path="/payroll/payslips" element={<GeneratePayslips />} />
            <Route path="/payroll/bonus" element={<BonusIncentives />} />
            <Route path="/payroll/reimbursements" element={<Reimbursements />} />
            <Route path="/payroll/loans" element={<LoansAdvances />} />
            <Route path="/payroll/tax" element={<TaxManagement />} />
            <Route path="/payroll/reports" element={<PayrollReports />} />
            
            {/* Recruitment Module */}
            <Route path="/recruitment" element={<Navigate to="/recruitment/dashboard" replace />} />
            <Route path="/recruitment/dashboard" element={<RecruitmentDashboard />} />
            <Route path="/recruitment/jobs" element={<JobOpenings />} />
            <Route path="/recruitment/candidates" element={<Candidates />} />
            <Route path="/recruitment/interviews" element={<InterviewSchedule />} />
            <Route path="/recruitment/offers" element={<OfferLetters />} />
            <Route path="/recruitment/pipeline" element={<HiringPipeline />} />
            <Route path="/recruitment/reports" element={<RecruitmentReports />} />
            
            {/* Onboarding Module */}
            <Route path="/onboarding" element={<Navigate to="/onboarding/new-joiners" replace />} />
            <Route path="/onboarding/new-joiners" element={<NewJoiners />} />
            <Route path="/onboarding/documents" element={<DocumentVerification />} />
            <Route path="/onboarding/assets" element={<AssetAllocation />} />
            <Route path="/onboarding/welcome-kit" element={<WelcomeKit />} />
            <Route path="/onboarding/orientation" element={<Orientation />} />
            <Route path="/onboarding/probation" element={<Probation />} />
            
            {/* Performance Module */}
            <Route path="/performance" element={<Navigate to="/performance/goals" replace />} />
            <Route path="/performance/goals" element={<Goals />} />
            <Route path="/performance/kpis" element={<KPIs />} />
            <Route path="/performance/kras" element={<KRAs />} />
            <Route path="/performance/appraisals" element={<Appraisals />} />
            <Route path="/performance/reviews" element={<Reviews />} />
            <Route path="/performance/feedback" element={<Feedback />} />
            <Route path="/performance/promotions" element={<Promotions />} />

            {/* Project Management Module */}
            <Route path="/projects" element={<Navigate to="/projects/dashboard" replace />} />
            <Route path="/projects/dashboard" element={<ProjectDashboard />} />
            <Route path="/projects/list" element={<ProjectsList />} />
            <Route path="/projects/tasks" element={<Tasks />} />
            <Route path="/projects/sprint-board" element={<SprintBoard />} />
            <Route path="/projects/timesheets" element={<Timesheets />} />
            <Route path="/projects/milestones" element={<Milestones />} />
            <Route path="/projects/team" element={<TeamMembers />} />

            {/* Expenses Module */}
            <Route path="/expenses" element={<Navigate to="/expenses/claims" replace />} />
            <Route path="/expenses/claims" element={<ExpenseClaims />} />
            <Route path="/expenses/categories" element={<ExpenseCategories />} />
            <Route path="/expenses/approval" element={<ExpenseApproval />} />
            <Route path="/expenses/reimbursements" element={<ReimbursementsModule />} />
            <Route path="/expenses/reports" element={<ExpenseReports />} />

            {/* Documents Module */}
            <Route path="/documents" element={<Navigate to="/documents/employee" replace />} />
            <Route path="/documents/employee" element={<EmployeeDocumentsModule />} />
            <Route path="/documents/company" element={<CompanyDocuments />} />
            <Route path="/documents/policies" element={<HRPolicies />} />
            <Route path="/documents/templates" element={<Templates />} />
            <Route path="/documents/signatures" element={<DigitalSignatures />} />

            {/* Help Desk Module */}
            <Route path="/help-desk" element={<Navigate to="/help-desk/dashboard" replace />} />
            <Route path="/help-desk/dashboard" element={<HelpDeskDashboard />} />
            <Route path="/help-desk/tickets" element={<Tickets />} />
            <Route path="/help-desk/categories" element={<Categories />} />
            <Route path="/help-desk/priorities" element={<Priorities />} />
            <Route path="/help-desk/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/help-desk/reports" element={<HelpDeskReports />} />

            {/* Settings Module */}
            <Route path="/settings" element={<Navigate to="/settings/company" replace />} />
            <Route path="/settings/company" element={<SettingsCompany />} />
            <Route path="/settings/branding" element={<SettingsBranding />} />
            <Route path="/settings/organization" element={<SettingsOrganization />} />
            <Route path="/settings/users" element={<SettingsUsers />} />
            <Route path="/settings/hr" element={<SettingsHR />} />
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