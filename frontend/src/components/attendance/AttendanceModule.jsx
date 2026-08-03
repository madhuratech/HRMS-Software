import React, { useState } from 'react';
import { GeoPunch } from './GeoPunch';
import { LeaveApplication } from './LeaveApplication';
import { LeaveApprovals } from './LeaveApprovals';

import { MapPin, CalendarDays, CheckSquare } from 'lucide-react';


export function AttendanceModule({ userRole }) {
  const [activeTab, setActiveTab] = useState('punch');

  const canApprove = ['SUPER_ADMIN', 'BRANCH_MANAGER', 'HR_MANAGER'].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('punch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'punch' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
          
          <MapPin size={16} /> Attendance
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'leave' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
          
          <CalendarDays size={16} /> Apply Leave
        </button>
        {canApprove &&
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'approvals' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
          
            <CheckSquare size={16} /> Approvals
          </button>
        }
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'punch' && <GeoPunch />}
        {activeTab === 'leave' && <LeaveApplication />}
        {activeTab === 'approvals' && canApprove &&
        <div className="max-w-3xl mx-auto">
            <h3 className="font-bold text-slate-800 mb-4 text-xl">Pending Leave Requests</h3>
            <LeaveApprovals />
          </div>
        }
      </div>
    </div>);

}