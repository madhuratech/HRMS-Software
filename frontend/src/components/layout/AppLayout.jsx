import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ userRole, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the current view from the path to pass to Header
  const currentView = location.pathname.substring(1).replace(/\//g, '-') || 'dashboard';
  const isAIAssistant = location.pathname === '/ai-assistant';

  // Role-based dashboard route check and redirection to prevent stale session dashboards
  useEffect(() => {
    const path = location.pathname;
    const roleUpper = (userRole || 'EMPLOYEE').toUpperCase();

    const getDashboardRoute = () => {
      if (roleUpper === 'SUPER_ADMIN' || roleUpper === 'ADMIN' || roleUpper === 'Super Admin') return '/dashboard';
      if (roleUpper === 'HR' || roleUpper === 'HR_MANAGER' || roleUpper === 'HR Manager') return '/dashboard';
      if (roleUpper === 'TEAM_LEADER' || roleUpper === 'Team Leader') return '/team-leader/dashboard';
      if (roleUpper === 'SERVICE_STAFF' || roleUpper === 'SALES_MANAGER') return '/dashboard';
      return '/employee/dashboard';
    };

    const targetDashboard = getDashboardRoute();

    // 1. Role-based prefix route guard redirection (only for employee self-service portal /employee/...)
    if ((path === '/employee' || path.startsWith('/employee/')) && roleUpper !== 'EMPLOYEE') {
      navigate(targetDashboard, { replace: true });
      return;
    }

    if ((path === '/team-leader' || path.startsWith('/team-leader/')) && roleUpper !== 'TEAM_LEADER' && roleUpper !== 'SUPER_ADMIN' && roleUpper !== 'SUPER ADMIN') {
      navigate(targetDashboard, { replace: true });
      return;
    }

    // 2. If the path is a dashboard URL, ensure it matches the current user role
    const dashboardPaths = ['/dashboard', '/team-leader/dashboard', '/employee/dashboard', '/'];
    if (dashboardPaths.includes(path)) {
      if (path !== targetDashboard) {
        navigate(targetDashboard, { replace: true });
      }
    }
  }, [userRole, location.pathname, navigate]);

  return (
    <div className="flex h-screen font-sans bg-slate-50 text-slate-900">
      <Sidebar
        userRole={userRole}
        onLogout={onLogout}
      />

      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header title={currentView} userRole={userRole} currentView={currentView} />

        <main className={`flex-1 bg-slate-50 ${isAIAssistant ? 'overflow-hidden' : 'overflow-y-auto'}`} style={{ padding: isAIAssistant ? '0px' : '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
