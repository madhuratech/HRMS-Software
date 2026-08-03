import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ userRole, onLogout }) {
  const location = useLocation();
  
  // Extract the current view from the path to pass to Header
  // e.g. /dashboard -> dashboard, /employees/list -> employees-list
  const currentView = location.pathname.substring(1).replace(/\//g, '-') || 'dashboard';

  return (
    <div className="flex h-screen font-sans bg-slate-50 text-slate-900">
      <Sidebar
        userRole={userRole}
        onLogout={onLogout} 
      />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header title={currentView} userRole={userRole} currentView={currentView} />
        
        <main className="flex-1 overflow-y-auto bg-slate-50" style={{ padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
