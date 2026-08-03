import React, { useState } from 'react';
import { 
  Users, List, UserPlus, User, History, 
  TrendingUp, ArrowRightLeft, LogOut, FileText,
  Briefcase
} from 'lucide-react';
import './employee-module.css';
import './sidebar-styles.css';

// Import all our newly created components
import EmployeeDirectory from './EmployeeDirectory';
import EmployeeListContent from './EmployeeListContent';
import AddEmployeeForm from './AddEmployeeForm';
import EmployeeProfileContent from './EmployeeProfileContent';
import EmploymentHistory from './EmploymentHistory';
import PromotionsContent from './PromotionsContent';
import TransfersContent from './TransfersContent';
import ExitManagement from './ExitManagement';
import EmployeeDocuments from './EmployeeDocuments';

const sidebarItems = [
  { id: 'directory', label: 'Employee Directory', icon: Users, component: EmployeeDirectory },
  { id: 'list', label: 'Employee List', icon: List, component: EmployeeListContent },
  { id: 'add', label: 'Add Employee', icon: UserPlus, component: AddEmployeeForm },
  { id: 'profile', label: 'Employee Profile', icon: User, component: EmployeeProfileContent },
  { id: 'history', label: 'Employment History', icon: History, component: EmploymentHistory },
  { id: 'promotions', label: 'Promotions', icon: TrendingUp, component: PromotionsContent },
  { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft, component: TransfersContent },
  { id: 'exit', label: 'Exit Management', icon: LogOut, component: ExitManagement },
  { id: 'documents', label: 'Employee Documents', icon: FileText, component: EmployeeDocuments },
];

export default function EmployeeModule() {
  const [activeTab, setActiveTab] = useState('directory');

  // Find the active component
  const ActiveComponent = sidebarItems.find(item => item.id === activeTab)?.component || EmployeeDirectory;

  return (
    <div className="hrms-module-container">
      {/* Sidebar */}
      <aside className="hrms-sidebar">
        <div className="hrms-sidebar-header">
          <h2><Briefcase size={20} color="#2952E3" /> Employees</h2>
        </div>
        <div className="hrms-sidebar-menu">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`hrms-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="hrms-main-wrapper">
        <ActiveComponent onNavigate={(tabId) => setActiveTab(tabId)} />
      </main>
    </div>
  );
}
