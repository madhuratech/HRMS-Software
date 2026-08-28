import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ userRole, onLogout }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Extract the current view from the path to pass to Header
  // e.g. /dashboard -> dashboard, /employees/list -> employees-list
  const currentView = location.pathname.substring(1).replace(/\//g, '-') || 'dashboard';

  const isAIAssistant = location.pathname === '/ai-assistant';

  return (
    <div className="flex h-screen font-sans bg-slate-50 text-slate-900 overflow-hidden safe-area-bottom">
      <Sidebar
        userRole={userRole}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
      />

      <div className={`flex-1 min-w-0 ml-0 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : ""}`}>
        <Header 
          title={currentView} 
          userRole={userRole} 
          currentView={currentView} 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />

        <main className={`flex-1 bg-slate-50 ${isAIAssistant ? 'overflow-hidden' : 'overflow-y-auto w-full'}`} style={{ padding: isAIAssistant ? '0px' : '16px', '@media (min-width: 768px)': { padding: '24px' } }}>
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Overlay for Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
