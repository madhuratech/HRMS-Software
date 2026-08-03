import React, { useState } from 'react';
import { Check, X, Calendar } from 'lucide-react';


const MOCK_REQUESTS = [
{
  id: 'lr_1',
  employeeId: 'emp_002',
  employeeName: 'Sarah Jenkins',
  type: 'Sick',
  startDate: '2023-11-20',
  endDate: '2023-11-21',
  days: 2,
  reason: 'High fever and flu symptoms',
  status: 'Pending',
  appliedOn: '2023-11-19'
},
{
  id: 'lr_2',
  employeeId: 'emp_005',
  employeeName: 'Mike Ross',
  type: 'Casual',
  startDate: '2023-11-25',
  endDate: '2023-11-25',
  days: 1,
  reason: 'Personal family matter',
  status: 'Pending',
  appliedOn: '2023-11-18'
},
{
  id: 'lr_3',
  employeeId: 'emp_008',
  employeeName: 'David Kim',
  type: 'Privilege',
  startDate: '2023-12-01',
  endDate: '2023-12-05',
  days: 5,
  reason: 'Annual vacation',
  status: 'Pending',
  appliedOn: '2023-11-15'
}];







export function LeaveApprovals({ limit, compact = false }) {
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const handleAction = (id, action) => {
    setRequests(requests.filter((req) => req.id !== id));
    // In a real app, update backend
  };

  const displayRequests = limit ? requests.slice(0, limit) : requests;

  if (requests.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Check size={48} className="mx-auto mb-3 text-slate-300" />
        <p>No pending leave requests</p>
      </div>);

  }

  return (
    <div className="space-y-4">
      {displayRequests.map((req) =>
      <div key={req.id} className={`bg-white border border-slate-200 rounded-xl p-4 ${compact ? 'text-sm' : ''} shadow-sm`}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-slate-800">{req.employeeName}</h4>
              <p className="text-slate-500 text-xs">{req.type} Leave • {req.days} Day{req.days > 1 ? 's' : ''}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                {req.status}
              </span>
              <p className="text-slate-400 text-[10px] mt-1">Applied: {req.appliedOn}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3 mb-4 text-slate-600 text-sm">
            <p className="mb-2">"{req.reason}"</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Calendar size={12} />
              {req.startDate} — {req.endDate}
            </div>
          </div>

          <div className="flex gap-3">
            <button
            onClick={() => handleAction(req.id, 'Approved')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
            
              <Check size={16} /> Approve
            </button>
            <button
            onClick={() => handleAction(req.id, 'Rejected')}
            className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
            
              <X size={16} /> Reject
            </button>
          </div>
        </div>
      )}
    </div>);

}