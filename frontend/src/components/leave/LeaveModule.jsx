import React, { useState } from 'react';
import LeaveDashboard from './LeaveDashboard';
import LeaveApplications from './LeaveApplications';
import LeaveApproval from './LeaveApproval';
import LeaveBalance from './LeaveBalance';
import LeaveTypes from './LeaveTypes';
import HolidayList from './HolidayList';
import CompOff from './CompOff';

export default function LeaveModule() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Leave Dashboard' },
    { id: 'applications', label: 'Leave Applications' },
    { id: 'approval', label: 'Leave Approval' },
    { id: 'balance', label: 'Leave Balance' },
    { id: 'types', label: 'Leave Types' },
    { id: 'holiday', label: 'Holiday List' },
    { id: 'compoff', label: 'Comp Off' }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      

      {/* Main Content Area */}
      <div>
        {activeTab === 'dashboard' && <LeaveDashboard />}
        {activeTab === 'applications' && <LeaveApplications />}
        {activeTab === 'approval' && <LeaveApproval />}
        {activeTab === 'balance' && <LeaveBalance />}
        {activeTab === 'types' && <LeaveTypes />}
        {activeTab === 'holiday' && <HolidayList />}
        {activeTab === 'compoff' && <CompOff />}
      </div>
    </div>
  );
}
