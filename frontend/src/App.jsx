import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { PermissionProvider } from './context/PermissionContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './components/auth/Login';
import { CustomerDemoLogin } from './components/auth/CustomerDemoLogin';
import { Register } from './components/auth/Register';
import { LandingPage } from './components/landing/LandingPage';
import { PricingPage } from './components/landing/PricingPage';
import { CustomerTrialModal } from './components/auth/CustomerTrialModal';
import { CustomerActivationModal } from './components/auth/CustomerActivationModal';
import { ContactModal } from './components/auth/ContactModal';
import { DemoPersonaModal } from './components/demo/DemoPersonaModal';
import { DemoTutorialTour } from './components/demo/DemoTutorialTour';
import { DemoSessionBanner } from './components/demo/DemoSessionBanner';
import { isDemoSessionActive, endDemoSession, getDemoTimeRemainingSeconds, initializeDummyDatabase } from './lib/demoDummyStore';
import { TrialExpiredPaywall } from './components/auth/TrialExpiredPaywall';
import { MasterAdminDashboard } from './components/dashboard/MasterAdminDashboard';
import { MasterAdminLogin } from './components/auth/MasterAdminLogin';
import './components/landing/LandingPage.css';
import { PermissionGuard } from './components/auth/PermissionGuard';
import { AdminManagerRegister } from './components/auth/AdminManagerRegister';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import SalaryStructure from './components/payroll/SalaryStructure';
import SalaryComponents from './components/payroll/SalaryComponents';
import PayrollProcessing from './components/payroll/PayrollProcessing';
import GeneratePayslips from './components/payroll/GeneratePayslips';
import BonusIncentives from './components/payroll/BonusIncentives';
import Reimbursements from './components/payroll/Reimbursements';
import LoansAdvances from './components/payroll/LoansAdvances';
import TaxManagement from './components/payroll/TaxManagement';
import PayrollReports from './components/payroll/PayrollReports';
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
import CandidateScreening from './components/recruitment/CandidateScreening';
import InterviewSchedule from './components/recruitment/InterviewSchedule';
import OfferLetters from './components/recruitment/OfferLetters';
import HiringPipeline from './components/recruitment/HiringPipeline';
import RecruitmentReports from './components/recruitment/RecruitmentReports';
import PublicCareerPage from './components/public/PublicCareerPage';
import PublicJobDetails from './components/public/PublicJobDetails';

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

// Client Management Module Imports
import AllClients from './components/clients/AllClients';
import AddClient from './components/clients/AddClient';
import ClientDetails from './components/clients/ClientDetails';

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

import { apiFetch } from './lib/api';
import { Sparkles, AlertTriangle, ShieldCheck, Clock, LogOut, ArrowUpRight } from 'lucide-react';

function App() {
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'register' | 'pricing'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole, setUserRole] = useState('SUPER_ADMIN');
  const [userName, setUserName] = useState('');

  // 3-Hour Customer Free Trial & Activation Modals State
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationLeadData, setActivationLeadData] = useState(null);
  const [isTutorialTourOpen, setIsTutorialTourOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isDemoSandbox, setIsDemoSandbox] = useState(() => {
    return localStorage.getItem('hrms_is_demo_sandbox') === 'true';
  });
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [isPaywallActive, setIsPaywallActive] = useState(false);
  const [trialUser, setTrialUser] = useState(null);

  // On mount: restore auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for active trial or demo sandbox session
        const storedTrial = localStorage.getItem('hrms_trial_session');
        if (storedTrial) {
          try {
            const parsedTrial = JSON.parse(storedTrial);
            if (parsedTrial && parsedTrial.isActive) {
              const now = Date.now();
              if (parsedTrial.expiresAt && now >= parsedTrial.expiresAt) {
                endDemoSession();
                localStorage.removeItem('hrms_auth');
              } else {
                setIsTrialActive(true);
                setTrialUser(parsedTrial);
                if (parsedTrial.isDemo || localStorage.getItem('hrms_is_demo_sandbox') === 'true') {
                  setIsDemoSandbox(true);
                }
              }
            }
          } catch (e) {
            console.error('Trial parse error:', e);
          }
        }

        const storedAuth = localStorage.getItem('hrms_auth');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          if (authData && authData.loggedIn && authData.token) {
            try {
              const res = await apiFetch('/auth/me');
              if (res && res.success && res.user) {
                const refreshedUser = res.user;
                const refreshedRole = res.role || refreshedUser.role;
                const refreshedName = refreshedUser.name;
                setUserRole(refreshedRole);
                setUserName(refreshedName);
                setIsLoggedIn(true);
                localStorage.setItem('userRole', refreshedRole);
                localStorage.setItem('userName', refreshedName);
                setIsInitializing(false);
                return;
              }
            } catch (apiErr) {
              console.warn('Could not validate session via /auth/me:', apiErr);
            }

            const role = authData.role || authData.user?.role || 'SUPER_ADMIN';
            const name = authData.name || authData.user?.name || 'Super Admin';
            setUserRole(role);
            setUserName(name);
            setIsLoggedIn(true);
            localStorage.setItem('userRole', role);
            localStorage.setItem('userName', name);
          }
        }
      } catch (err) {
        localStorage.removeItem('hrms_auth');
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  // URL Synchronization for direct navigation (/pricing, /master-admin, /activate-trial, /)
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      if (path.startsWith('/activate-trial')) {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');
        if (token || email) {
          // Look up full lead data from localStorage (has password, name, phone etc.)
          let leadData = { token, email: email || '', name: 'Customer Admin' };
          try {
            const stored = JSON.parse(localStorage.getItem('hrms_trial_submissions') || '[]');
            const found = stored.find(l => l.email && email && l.email.toLowerCase() === email.toLowerCase());
            if (found) leadData = { ...found, token };
          } catch (e) {}
          setActivationLeadData(leadData);
          setIsActivationModalOpen(true);
          // Set landing as backdrop
          window.history.replaceState({}, '', '/');
          setAuthView('landing');
        }
      } else if (path === '/pricing') {
        setAuthView('pricing');
      } else if (path === '/master-admin' || path === '/admin') {
        setAuthView('master-admin');
      } else if (path === '/login') {
        setAuthView('login');
      } else if (path === '/register') {
        setAuthView('register');
      } else if (path === '/' || path === '') {
        setAuthView('landing');
      } else if (!isLoggedIn && !path.startsWith('/career')) {
        // If an unauthenticated user arrives at or was left at an internal route (e.g. /attendance/gps), normalize address bar to /
        window.history.replaceState({}, '', '/');
        setAuthView('landing');
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, [isLoggedIn]);

  const handleLogin = (role, name, userObj) => {
    const finalRole = role || (userObj && userObj.role) || 'SUPER_ADMIN';
    const finalName = name || (userObj && userObj.name) || 'Admin User';
    const finalId = (userObj && (userObj.userId || userObj.id)) || 1;
    const finalEmpId = (userObj && (userObj.employeeId || userObj.employee_id)) || finalId;
    const finalEmpCode = (userObj && (userObj.employeeCode || userObj.employee_code || userObj.emp_id)) || `EMP${String(finalEmpId).padStart(4, '0')}`;
    const finalEmail = (userObj && userObj.email) || '';
    const finalToken = (userObj && userObj.token) || 'mock_trial_jwt_token';

    setUserRole(finalRole);
    setUserName(finalName);
    setIsLoggedIn(true);
    setIsPaywallActive(false);
    localStorage.setItem('userRole', finalRole);
    localStorage.setItem('userName', finalName);

    // Ensure URL is set to /dashboard when logging in from root or auth screens
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '' || currentPath === '/login' || currentPath === '/pricing' || currentPath === '/register') {
        window.history.pushState({}, '', '/dashboard');
      }
    }

    const authObj = {
      role: finalRole,
      name: finalName,
      loggedIn: true,
      token: finalToken,
      user: {
        id: finalId,
        userId: finalId,
        employee_id: finalEmpId,
        employeeId: finalEmpId,
        emp_id: finalEmpCode,
        employeeCode: finalEmpCode,
        name: finalName,
        email: finalEmail,
        role: finalRole,
        company: (userObj && userObj.company) || 'Madhura Enterprise'
      }
    };
    localStorage.setItem('hrms_auth', JSON.stringify(authObj));
  };

  // Start / Activate 3-Hour Customer Demo Session with Isolated Dummy Database Storage
  const handleCompleteCustomerOnboarding = (onboardedData) => {
    const companyName = onboardedData.company || 'Customer Organization';
    const customerName = onboardedData.name || 'Customer Admin';
    const customerEmail = onboardedData.email || '';
    const now = (onboardedData.demoMeta && onboardedData.demoMeta.startedAt) || Date.now();
    const expiresAt = (onboardedData.demoMeta && onboardedData.demoMeta.expiresAt) || (now + 3 * 60 * 60 * 1000); // 3 hours

    // Initialize fresh dummy database tailored specifically to customer's company and customer admin
    initializeDummyDatabase(companyName, customerName, true);

    const trialPayload = {
      id: 1,
      userId: 1,
      emp_id: 'SUPER ADMIN',
      employeeCode: 'SUPER ADMIN',
      designation: 'Managing Director & Super Admin',
      isActive: true,
      isDemo: true,
      is3HourDemo: true,
      startedAt: now,
      expiresAt: expiresAt,
      company: companyName,
      name: customerName,
      email: customerEmail,
      phone: onboardedData.phone || '',
      industry: onboardedData.industry || 'IT & Software',
      employeeSize: onboardedData.employeeSize || '21-100',
      role: 'SUPER_ADMIN'
    };

    localStorage.setItem('hrms_trial_session', JSON.stringify(trialPayload));
    localStorage.setItem('hrms_is_demo_sandbox', 'true');
    setIsDemoSandbox(true);
    setIsTrialActive(true);
    setTrialUser(trialPayload);
    setIsActivationModalOpen(false);
    setIsTrialModalOpen(false);
    setIsPaywallActive(false);

    // Immediate Super Admin Login branded with customer's name and organization
    handleLogin('SUPER_ADMIN', customerName, trialPayload);

    // Automatically trigger Interactive Tutorial Tour with skip buttons!
    setTimeout(() => {
      setIsTutorialTourOpen(true);
    }, 450);
  };

  const handleStartTrial = (customerData) => {
    handleCompleteCustomerOnboarding(customerData);
  };

  // Launch Odoo-Style Live Demo Sandbox
  const handleLaunchDemo = (persona) => {
    const p = persona || {
      role: 'SUPER_ADMIN',
      name: 'Rajesh Sharma (CEO)',
      email: 'ceo.demo@madhuratech.com',
      company: 'Madhura Global Enterprises',
      designation: 'Managing Director & CEO',
      emp_id: 'EMP0001'
    };

    const demoPayload = {
      isActive: true,
      isDemo: true,
      startedAt: Date.now(),
      daysTotal: 3,
      daysRemaining: 3,
      company: p.company || 'Madhura Global Enterprises',
      name: p.name,
      email: p.email,
      role: p.role,
      designation: p.designation,
      emp_id: p.emp_id || 'EMP0001'
    };

    localStorage.setItem('hrms_trial_session', JSON.stringify(demoPayload));
    localStorage.setItem('hrms_is_demo_sandbox', 'true');
    setIsDemoSandbox(true);
    setIsTrialActive(true);
    setTrialUser(demoPayload);
    setIsDemoModalOpen(false);
    setIsTrialModalOpen(false);
    setIsPaywallActive(false);

    handleLogin(p.role, p.name, demoPayload);
  };

  // Switch demo persona on the fly (Odoo-Style)
  const handleSwitchDemoRole = (roleObj) => {
    const updatedUser = {
      ...trialUser,
      role: roleObj.role,
      name: roleObj.label.split('(')[0].trim(),
      email: roleObj.email,
      company: trialUser?.company || 'Madhura Global Enterprises'
    };
    setTrialUser(updatedUser);
    setUserRole(roleObj.role);
    setUserName(updatedUser.name);
    localStorage.setItem('userRole', roleObj.role);
    localStorage.setItem('userName', updatedUser.name);

    const storedAuth = localStorage.getItem('hrms_auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        parsed.role = roleObj.role;
        parsed.name = updatedUser.name;
        if (parsed.user) {
          parsed.user.role = roleObj.role;
          parsed.user.name = updatedUser.name;
          parsed.user.email = roleObj.email;
        }
        localStorage.setItem('hrms_auth', JSON.stringify(parsed));
      } catch (e) {}
    }

    // Trigger instant permission sync
    window.dispatchEvent(new CustomEvent('permissionsUpdated', { detail: { role: roleObj.role } }));
  };

  // Reset Demo Database
  const handleResetDatabase = async () => {
    try {
      await apiFetch('/demo/reset-database', { method: 'POST' }).catch(() => {});
    } catch (e) {
      console.error('Reset error:', e);
    }
  };

  // End Trial Session / Cut Session -> Shows Paywall
  const handleCutSession = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/pricing');
    }
    setIsLoggedIn(false);
    setIsPaywallActive(true);
    localStorage.removeItem('hrms_auth');
    localStorage.removeItem('hrms_is_demo_sandbox');
    setIsDemoSandbox(false);
    endDemoSession();
    if (trialUser) {
      localStorage.setItem('hrms_trial_session', JSON.stringify({ ...trialUser, isActive: false, isExpired: true }));
    }
  };

  // Renew / Restart trial session
  const handleRenewTrial = () => {
    setIsPaywallActive(false);
    setIsTrialModalOpen(true);
  };

  // Pay / Subscribe success from Paywall
  const handleSubscribeSuccess = (planKey) => {
    const activeUser = trialUser || { name: 'Subscribed Admin', company: 'Enterprise' };
    const paidPayload = {
      ...activeUser,
      isPaid: true,
      plan: planKey,
      role: 'SUPER_ADMIN'
    };
    localStorage.removeItem('hrms_trial_session');
    setIsTrialActive(false);
    setIsPaywallActive(false);
    handleLogin('SUPER_ADMIN', activeUser.name, paidPayload);
  };

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold tracking-wide">Loading Madhura HRMS...</p>
        </div>
      </div>
    );
  }

  // If trial session was cut or expired -> Show realistic Paywall
  if (isPaywallActive) {
    return (
      <TrialExpiredPaywall
        trialUser={trialUser}
        onRenewTrial={handleRenewTrial}
        onSubscribeSuccess={handleSubscribeSuccess}
        onReturnHome={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
          setIsPaywallActive(false);
          setAuthView('landing');
        }}
      />
    );
  }

  if (!isLoggedIn) {
    // Check if public career page is requested directly
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/career')) {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="/career" element={<PublicCareerPage />} />
            <Route path="/career/job/:slug" element={<PublicJobDetails />} />
            <Route path="*" element={<Navigate to="/career" replace />} />
          </Routes>
        </BrowserRouter>
      );
    }

    // Master Admin Portal Login Route for company usage (/master-admin or /admin)
    if (authView === 'master-admin' || (typeof window !== 'undefined' && (window.location.pathname === '/master-admin' || window.location.pathname === '/admin'))) {
      return (
        <MasterAdminLogin
          onLoginSuccess={(payload) => {
            handleLogin('MASTER_ADMIN', 'Master Admin', payload);
          }}
          onHomeClick={() => {
            window.history.pushState({}, '', '/');
            setAuthView('landing');
          }}
        />
      );
    }

    if (authView === 'register') {
      return (
        <Register
          onRegister={handleLogin}
          onLoginClick={() => {
            window.history.pushState({}, '', '/login');
            setAuthView('login');
          }}
          onHomeClick={() => {
            window.history.pushState({}, '', '/');
            setAuthView('landing');
          }}
        />
      );
    }

    if (authView === 'login' || (typeof window !== 'undefined' && window.location.pathname === '/login')) {
      return (
        <CustomerDemoLogin
          onLoginSuccess={(role, name, payload) => {
            handleLogin(role, name, payload);
          }}
          onOpenTrialModal={() => {
            setIsTrialModalOpen(true);
          }}
          onHomeClick={() => {
            window.history.pushState({}, '', '/');
            setAuthView('landing');
          }}
        />
      );
    }

    if (authView === 'staff-login') {
      return (
        <Login
          onLogin={handleLogin}
          onRegisterClick={() => setIsTrialModalOpen(true)}
          onCustomerDemoLogin={() => {
            window.history.pushState({}, '', '/login');
            setAuthView('login');
          }}
          onHomeClick={() => {
            window.history.pushState({}, '', '/');
            setAuthView('landing');
          }}
        />
      );
    }

    if (authView === 'pricing' || (typeof window !== 'undefined' && window.location.pathname === '/pricing')) {
      return (
        <>
          <PricingPage
            onOpenTrial={() => setIsTrialModalOpen(true)}
            onOpenCustomerLogin={() => {
              window.history.pushState({}, '', '/login');
              setAuthView('login');
            }}
            onOpenLogin={() => setIsTrialModalOpen(true)}
            onBackToHome={() => {
              window.history.pushState({}, '', '/');
              setAuthView('landing');
            }}
          />
          <CustomerTrialModal
            isOpen={isTrialModalOpen}
            onClose={() => setIsTrialModalOpen(false)}
            onActivationSuccess={(lead) => {
              setIsTrialModalOpen(false);
              setActivationLeadData(lead);
              setIsActivationModalOpen(true);
            }}
            onOpenLogin={() => {
              setIsTrialModalOpen(false);
              window.history.pushState({}, '', '/login');
              setAuthView('login');
            }}
          />
          <CustomerActivationModal
            isOpen={isActivationModalOpen}
            customerData={activationLeadData}
            onClose={() => setIsActivationModalOpen(false)}
            onComplete={handleCompleteCustomerOnboarding}
          />
          <DemoPersonaModal
            isOpen={isDemoModalOpen}
            onClose={() => setIsDemoModalOpen(false)}
            onLaunchDemo={handleLaunchDemo}
          />
          <ContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
          />
        </>
      );
    }

    // Default opening view: Landing Page
    return (
      <>
        <LandingPage
          onOpenTrial={() => setIsTrialModalOpen(true)}
          onOpenContact={() => setIsContactModalOpen(true)}
          onOpenCustomerLogin={() => {
            window.history.pushState({}, '', '/login');
            setAuthView('login');
          }}
          onOpenLogin={() => {
            window.history.pushState({}, '', '/login');
            setAuthView('login');
          }}
          onOpenDemoPersona={() => setIsDemoModalOpen(true)}
          onOpenPricing={() => {
            window.history.pushState({}, '', '/pricing');
            setAuthView('pricing');
          }}
          isLoggedIn={false}
        />
        <CustomerTrialModal
          isOpen={isTrialModalOpen}
          onClose={() => setIsTrialModalOpen(false)}
          onActivationSuccess={(lead) => {
            setIsTrialModalOpen(false);
            setActivationLeadData(lead);
            setIsActivationModalOpen(true);
          }}
          onOpenLogin={() => {
            setIsTrialModalOpen(false);
            window.history.pushState({}, '', '/login');
            setAuthView('login');
          }}
        />
        <CustomerActivationModal
          isOpen={isActivationModalOpen}
          customerData={activationLeadData}
          onClose={() => setIsActivationModalOpen(false)}
          onComplete={handleCompleteCustomerOnboarding}
        />
        <DemoPersonaModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
          onLaunchDemo={handleLaunchDemo}
        />
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </>
    );
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    setAuthView('landing');
    localStorage.removeItem('hrms_auth');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');

    // Check if 3-Hour Demo session is still active
    const remaining = getDemoTimeRemainingSeconds();
    if (remaining <= 0) {
      localStorage.removeItem('hrms_is_demo_sandbox');
      setIsDemoSandbox(false);
      endDemoSession();
    } else {
      console.log(`[HRMS Demo] Logout with ${remaining}s remaining. Dummy DB preserved for customer re-login.`);
    }
  };

  // Dedicated Master Admin Portal (Central Organization & Forms Tracking)
  if (isLoggedIn && userRole === 'MASTER_ADMIN') {
    return (
      <ToastProvider>
        <MasterAdminDashboard
          onLogout={handleLogout}
          onLaunchWorkspace={(org) => {
            handleCompleteCustomerOnboarding(org);
          }}
          onHomeClick={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/');
            }
            setIsLoggedIn(false);
            setAuthView('landing');
          }}
        />
      </ToastProvider>
    );
  }

  // Authenticated Application (HRMS Software for Customers & Staff)
  return (
    <ToastProvider>
      <PermissionProvider>
        <BrowserRouter>
          <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50" style={{ height: '100vh', width: '100vw' }}>
            
            {/* Interactive Tutorial Tour with Skip Buttons */}
            <DemoTutorialTour
              isOpen={isTutorialTourOpen}
              onClose={() => setIsTutorialTourOpen(false)}
            />

            {/* 3-Hour Demo Workspace Banner with Live Countdown & Protected Dummy DB indicator */}
            {isDemoSandbox ? (
              <DemoSessionBanner
                companyName={trialUser?.company || 'My Organization'}
                customerName={userName || trialUser?.name || 'Super Admin'}
                onOpenTour={() => setIsTutorialTourOpen(true)}
                onCutSession={handleCutSession}
                onUpgrade={handleCutSession}
              />
            ) : isTrialActive ? (
              /* Standard 3-Day Trial Floating Banner */
              <div className="pb-top-trial-strip flex-shrink-0" style={{ position: 'relative', zIndex: 50 }}>
                <div className="pb-trial-strip-inner">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="font-bold text-white text-xs">
                      3-Day Free Trial Active
                    </span>
                    <span style={{
                      background: '#1e3a8a',
                      color: '#bfdbfe',
                      border: '1px solid #3b82f6',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {trialUser?.company || 'Enterprise'}
                    </span>
                    <span className="text-slate-300 text-xs hidden md:inline">
                      • <strong className="text-white">{trialUser?.name || 'Super Admin'}</strong> (Super Admin Privileges) • 3 Days Remaining
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCutSession()}
                      className="pb-trial-strip-btn upgrade"
                    >
                      <ArrowUpRight size={13} /> Upgrade Plan (₹59/mo)
                    </button>
                    <button
                      onClick={() => handleCutSession()}
                      className="pb-trial-strip-btn cut-session"
                      title="End your trial demo session and view subscription paywall"
                    >
                      <LogOut size={13} /> Cut / End Trial Session
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex-1 min-h-0 min-w-0 w-full overflow-hidden" style={{ height: (isDemoSandbox || isTrialActive) ? 'calc(100vh - 44px)' : '100vh' }}>
              <Routes>
                <Route element={<AppLayout userRole={userRole} onLogout={handleLogout} />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                userRole === 'EMPLOYEE' ? <EmployeeDashboard /> :
                userRole === 'TEAM_LEADER' ? <TeamLeaderDashboard /> :
                <SuperAdminDashboard />
              } />

              {/* Attendance Module */}
              <Route path="/attendance" element={<DailyAttendance />} />
              <Route path="/attendance/daily" element={<DailyAttendance />} />
              <Route path="/attendance/logs" element={<DailyAttendance />} />
              <Route path="/attendance/gps" element={<GPSAttendance />} />
              <Route path="/attendance/regularization" element={<Regularization />} />
              <Route path="/attendance/shifts" element={<ShiftRoster />} />
              <Route path="/attendance/shift-roster" element={<ShiftRoster />} />
              <Route path="/attendance/overtime" element={<Overtime />} />
              <Route path="/attendance/late-arrival" element={<LateArrival />} />
              <Route path="/attendance/reports" element={<AttendanceReports />} />
              <Route path="/attendance/visits" element={<PunchLocations />} />
              <Route path="/attendance/punch-locations" element={<PunchLocations />} />

              {/* Employee Module */}
              <Route path="/employees" element={<EmployeeDirectory />} />
              <Route path="/employees/list" element={<EmployeeListContent />} />
              <Route path="/employees/add" element={<AddEmployeeForm />} />
              <Route path="/employees/profile" element={<EmployeeProfileContent />} />
              <Route path="/employees/profile/:id" element={<EmployeeProfileContent />} />
              <Route path="/employees/history" element={<EmploymentHistory />} />
              <Route path="/employees/promotions" element={<PromotionsContent />} />
              <Route path="/employees/transfers" element={<TransfersContent />} />
              <Route path="/employees/exit" element={<ExitManagement />} />
              <Route path="/employees/documents" element={<EmployeeDocuments />} />
              <Route path="/employees/my-shift" element={<MyShift />} />
              <Route path="/employees/my-performance" element={<MyPerformance />} />

              {/* Team Leader Module */}
              <Route path="/team-leader/dashboard" element={<TeamLeaderDashboard />} />
              <Route path="/team-leader/attendance" element={<TeamAttendanceModule />} />
              <Route path="/team-leader/tasks" element={<TeamTasksModule />} />
              <Route path="/team-leader/leaves" element={<TeamLeaveModule />} />
              <Route path="/team-leader/performance" element={<TeamPerformanceModule />} />

              {/* Leave Module */}
              <Route path="/leaves" element={<LeaveDashboard />} />
              <Route path="/leave" element={<LeaveDashboard />} />
              <Route path="/leave-dashboard" element={<LeaveDashboard />} />
              <Route path="/leaves/requests" element={<LeaveApplications />} />
              <Route path="/leave-applications" element={<LeaveApplications />} />
              <Route path="/leaves/approvals" element={<LeaveApproval />} />
              <Route path="/leave-approval" element={<LeaveApproval />} />
              <Route path="/leaves/balances" element={<LeaveBalance />} />
              <Route path="/leave-balance" element={<LeaveBalance />} />
              <Route path="/leaves/types" element={<LeaveTypes />} />
              <Route path="/leave-types" element={<LeaveTypes />} />
              <Route path="/leaves/holidays" element={<HolidayList />} />
              <Route path="/holiday-list" element={<HolidayList />} />
              <Route path="/leaves/comp-off" element={<CompOff />} />
              <Route path="/comp-off" element={<CompOff />} />

              {/* Payroll Module */}
              <Route path="/payroll" element={<PayrollProcessing />} />
              <Route path="/payroll/processing" element={<PayrollProcessing />} />
              <Route path="/payroll/structure" element={<SalaryStructure />} />
              <Route path="/payroll/salary-structure" element={<SalaryStructure />} />
              <Route path="/payroll/components" element={<SalaryComponents />} />
              <Route path="/payroll/generate-payslips" element={<GeneratePayslips />} />
              <Route path="/payroll/payslips" element={<GeneratePayslips />} />
              <Route path="/payroll/bonus" element={<BonusIncentives />} />
              <Route path="/payroll/reimbursements" element={<Reimbursements />} />
              <Route path="/payroll/loans" element={<LoansAdvances />} />
              <Route path="/payroll/tax" element={<TaxManagement />} />
              <Route path="/payroll/reports" element={<PayrollReports />} />

              {/* Organization Module */}
              <Route path="/organization/company-profile" element={<CompanyProfile />} />
              <Route path="/company-profile" element={<CompanyProfile />} />
              <Route path="/organization/departments" element={<Departments />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/organization/designations" element={<Designations />} />
              <Route path="/designations" element={<Designations />} />
              <Route path="/organization/teams" element={<Teams />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/organization/shifts" element={<ShiftManagement />} />
              <Route path="/shift-management" element={<ShiftManagement />} />
              <Route path="/organization/holidays" element={<HolidayCalendar />} />
              <Route path="/holiday-calendar" element={<HolidayCalendar />} />
              <Route path="/organization/chart" element={<OrganizationChart />} />
              <Route path="/organization-chart" element={<OrganizationChart />} />
              <Route path="/organization/user-roles" element={<UserRoles />} />

              {/* Communication Module */}
              <Route path="/communication/newsfeed" element={<NewsFeed />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Reports Module */}
              <Route path="/reports" element={<ReportsDirectory />} />
              <Route path="/reports/directory" element={<ReportsDirectory />} />
              <Route path="/reports/employee" element={<EmployeeReports />} />
              <Route path="/reports/attendance" element={<AttendanceReportsModule />} />
              <Route path="/reports/leave" element={<LeaveReports />} />
              <Route path="/reports/payroll" element={<PayrollReportsModule />} />
              <Route path="/reports/recruitment" element={<RecruitmentReportsModule />} />
              <Route path="/reports/performance" element={<PerformanceReports />} />
              <Route path="/reports/projects" element={<ProjectReports />} />

              {/* Recruitment Module */}
              <Route path="/recruitment" element={<RecruitmentDashboard />} />
              <Route path="/recruitment/dashboard" element={<RecruitmentDashboard />} />
              <Route path="/recruitment/jobs" element={<JobOpenings />} />
              <Route path="/recruitment/candidates" element={<Candidates />} />
              <Route path="/recruitment/screening" element={<CandidateScreening />} />
              <Route path="/recruitment/interviews" element={<InterviewSchedule />} />
              <Route path="/recruitment/offers" element={<OfferLetters />} />
              <Route path="/recruitment/pipeline" element={<HiringPipeline />} />

              {/* Onboarding Module */}
              <Route path="/onboarding" element={<NewJoiners />} />
              <Route path="/onboarding/new-joiners" element={<NewJoiners />} />
              <Route path="/onboarding/documents" element={<DocumentVerification />} />
              <Route path="/onboarding/assets" element={<AssetAllocation />} />
              <Route path="/onboarding/welcome-kit" element={<WelcomeKit />} />
              <Route path="/onboarding/orientation" element={<Orientation />} />
              <Route path="/onboarding/probation" element={<Probation />} />

              {/* Performance Module */}
              <Route path="/performance" element={<Goals />} />
              <Route path="/performance/goals" element={<Goals />} />
              <Route path="/performance/kpis" element={<KPIs />} />
              <Route path="/performance/kras" element={<KRAs />} />
              <Route path="/performance/appraisals" element={<Appraisals />} />
              <Route path="/performance/reviews" element={<Reviews />} />
              <Route path="/performance/feedback" element={<Feedback />} />
              <Route path="/performance/promotions" element={<Promotions />} />

              {/* Project Management Module */}
              <Route path="/projects" element={<ProjectDashboard />} />
              <Route path="/projects/dashboard" element={<ProjectDashboard />} />
              <Route path="/projects/list" element={<ProjectsList />} />
              <Route path="/projects/tasks" element={<Tasks />} />
              <Route path="/projects/sprint-board" element={<SprintBoard />} />
              <Route path="/projects/timesheets" element={<Timesheets />} />
              <Route path="/projects/milestones" element={<Milestones />} />
              <Route path="/projects/team" element={<TeamMembers />} />

              {/* Client Management Module */}
              <Route path="/clients" element={<AllClients />} />
              <Route path="/clients/list" element={<AllClients />} />
              <Route path="/clients/add" element={<AddClient />} />
              <Route path="/clients/:id" element={<ClientDetails />} />
              <Route path="/clients/:id/edit" element={<AddClient isEdit={true} />} />

              {/* Expenses Module */}
              <Route path="/expenses" element={<ExpenseClaims />} />
              <Route path="/expenses/claims" element={<ExpenseClaims />} />
              <Route path="/expenses/categories" element={<ExpenseCategories />} />
              <Route path="/expenses/approval" element={<ExpenseApproval />} />
              <Route path="/expenses/reimbursements" element={<ReimbursementsModule />} />

              {/* Documents Module */}
              <Route path="/documents" element={<EmployeeDocumentsModule />} />
              <Route path="/documents/employee" element={<EmployeeDocumentsModule />} />
              <Route path="/documents/company" element={<CompanyDocuments />} />
              <Route path="/documents/policies" element={<HRPolicies />} />
              <Route path="/documents/templates" element={<Templates />} />
              <Route path="/documents/signatures" element={<DigitalSignatures />} />

              {/* Help Desk Module */}
              <Route path="/help-desk" element={<HelpDeskDashboard />} />
              <Route path="/help-desk/dashboard" element={<HelpDeskDashboard />} />
              <Route path="/help-desk/tickets" element={<Tickets />} />
              <Route path="/help-desk/categories" element={<Categories />} />
              <Route path="/help-desk/priorities" element={<Priorities />} />
              <Route path="/help-desk/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/help-desk/reports" element={<HelpDeskReports />} />

              {/* Settings Module */}
              <Route path="/settings" element={<SettingsCompany />} />
              <Route path="/settings/company" element={<SettingsCompany />} />
              <Route path="/settings/branding" element={<SettingsBranding />} />
              <Route path="/settings/organization" element={<SettingsOrganization />} />
              <Route path="/settings/users" element={<UserRoles />} />
              <Route path="/settings/hr" element={<SettingsHR />} />
              <Route path="/settings/communication" element={<SettingsCommunication />} />
              <Route path="/settings/integrations" element={<SettingsIntegrations />} />
              <Route path="/settings/security" element={<SettingsSecurity />} />
              <Route path="/settings/system" element={<SettingsSystem />} />
              <Route path="/admin-register" element={<AdminManagerRegister />} />

              {/* AI Assistant */}
              <Route path="/ai-assistant" element={<AIAssistantDashboard />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </PermissionProvider>
    </ToastProvider>
  );
}

export default App;