import React, { useState } from 'react';
import { Clock, Users, ChevronLeft, ChevronRight, CheckCircle, XCircle, ArrowRightLeft } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { MOCK_EMPLOYEES } from '../../lib/mockData';
import { useToast } from '../ui/Toast';

const SHIFTS = [
{ id: 'morning', label: 'Morning', time: '08:00 - 16:00', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
{ id: 'afternoon', label: 'Afternoon', time: '14:00 - 22:00', color: 'bg-orange-100 text-orange-800 border-orange-200' },
{ id: 'night', label: 'Night', time: '22:00 - 06:00', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
{ id: 'off', label: 'Day Off', time: '-', color: 'bg-slate-100 text-slate-500 border-slate-200' }];


export function ShiftScheduler() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allocations, setAllocations] = useState({});
  const [selectedShift, setSelectedShift] = useState(SHIFTS[0].id);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [alterationRequests, setAlterationRequests] = useState([
  { id: 1, employeeId: 'e2', employeeName: 'Mike Chen', date: '2023-10-25', currentShift: 'morning', requestedShift: 'afternoon', reason: 'Personal appointment', status: 'PENDING' }]
  );
  const { addToast } = useToast();

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const handleAllocation = (employeeId, dateStr) => {
    setAllocations((prev) => ({
      ...prev,
      [`${employeeId}-${dateStr}`]: selectedShift
    }));
  };

  const getShiftForCell = (employeeId, dateStr) => {
    const shiftId = allocations[`${employeeId}-${dateStr}`] || 'morning'; // Default to morning for demo
    return SHIFTS.find((s) => s.id === shiftId) || SHIFTS[0];
  };

  const handleApproveRequest = (reqId) => {
    const req = alterationRequests.find((r) => r.id === reqId);
    if (req) {
      setAllocations((prev) => ({
        ...prev,
        [`${req.employeeId}-${req.date}`]: req.requestedShift
      }));
      setAlterationRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: 'APPROVED' } : r));
      addToast('Shift alteration approved', 'success');
    }
  };

  const handleRejectRequest = (reqId) => {
    setAlterationRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: 'REJECTED' } : r));
    addToast('Shift alteration rejected', 'info');
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-blue-600" /> Shift Scheduling
          </h2>
          <p className="text-sm text-slate-500 mt-1">Allocate shifts for your team members</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-2 hover:bg-white rounded-md transition-all shadow-sm">
            <ChevronLeft size={16} />
          </button>
          <span className="px-4 text-sm font-bold text-slate-700 min-w-[140px] text-center">
            {format(startDate, 'MMM d')} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
          </span>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 hover:bg-white rounded-md transition-all shadow-sm">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Scheduler */}
        <div className="flex-1 space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {SHIFTS.map((shift) =>
            <button
              key={shift.id}
              onClick={() => setSelectedShift(shift.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
              selectedShift === shift.id ?
              'bg-blue-600 text-white border-blue-600 shadow-md' :
              'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`
              }>
              
                <div className={`w-3 h-3 rounded-full ${shift.id === selectedShift ? 'bg-white' : shift.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                <span className="font-medium text-sm">{shift.label}</span>
                <span className="text-xs opacity-75">({shift.time})</span>
              </button>
            )}
            <button
              onClick={() => setShowRequestModal(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-md">
              
              <ArrowRightLeft size={16} /> Request Alteration
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1000px]">
                <thead>
                  <tr>
                    <th className="p-4 text-left border-b border-r border-slate-200 bg-slate-50 w-64 sticky left-0 z-10">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
                        <Users size={14} /> Employee
                      </div>
                    </th>
                    {weekDays.map((day) =>
                    <th key={day.toString()} className="p-4 text-center border-b border-slate-200 bg-slate-50 min-w-[120px]">
                        <div className="font-bold text-slate-800">{format(day, 'EEE')}</div>
                        <div className="text-xs text-slate-500">{format(day, 'MMM d')}</div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_EMPLOYEES.map((employee) =>
                  <tr key={employee.id}>
                      <td className="p-4 border-r border-slate-200 bg-white sticky left-0 z-10">
                        <div className="font-bold text-slate-800">{employee.name}</div>
                        <div className="text-xs text-slate-500">{employee.role.replace('_', ' ')}</div>
                      </td>
                      {weekDays.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const shift = getShiftForCell(employee.id, dateStr);
                      return (
                        <td key={dateStr} className="p-2 text-center border-r border-dashed border-slate-100 last:border-r-0">
                            <button
                            onClick={() => handleAllocation(employee.id, dateStr)}
                            className={`w-full py-3 rounded-lg text-xs font-bold transition-all border ${shift.color} hover:brightness-95`}>
                            
                              {shift.label}
                              <div className="text-[10px] font-normal opacity-75 mt-0.5">{shift.time}</div>
                            </button>
                          </td>);

                    })}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alteration Requests Sidebar */}
        <div className="w-full md:w-80 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
              Shift Requests
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">{alterationRequests.filter((r) => r.status === 'PENDING').length} Pending</span>
            </h3>
            <div className="space-y-3">
              {alterationRequests.length === 0 ?
              <p className="text-sm text-slate-500 text-center py-4">No pending requests</p> :

              alterationRequests.map((req) =>
              <div key={req.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-slate-700">{req.employeeName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  req.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                  req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`
                  }>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">
                      Requesting <span className="font-bold text-slate-700">{SHIFTS.find((s) => s.id === req.requestedShift)?.label}</span> shift on {format(new Date(req.date), 'MMM d')}
                    </p>
                    <p className="text-xs text-slate-400 italic mb-3">"{req.reason}"</p>
                    
                    {req.status === 'PENDING' &&
                <div className="flex gap-2">
                        <button
                    onClick={() => handleApproveRequest(req.id)}
                    className="flex-1 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition-colors flex items-center justify-center gap-1">
                    
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button
                    onClick={() => handleRejectRequest(req.id)}
                    className="flex-1 py-1 bg-red-100 text-red-600 text-xs font-bold rounded hover:bg-red-200 transition-colors flex items-center justify-center gap-1">
                    
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                }
                  </div>
              )
              }
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Request Shift Alteration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  {MOCK_EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Desired Shift</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  {SHIFTS.map((s) => <option key={s.id} value={s.id}>{s.label} ({s.time})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm min-h-[80px]" placeholder="Why do you need this change?"></textarea>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-2 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-lg">
                
                  Cancel
                </button>
                <button
                onClick={() => {
                  // In a real app, this would submit to the backend
                  setAlterationRequests((prev) => [
                  {
                    id: Math.random(),
                    employeeId: 'e2',
                    employeeName: 'Mike Chen',
                    date: '2023-10-26',
                    currentShift: 'morning',
                    requestedShift: 'night',
                    reason: 'Emergency',
                    status: 'PENDING'
                  },
                  ...prev]
                  );
                  setShowRequestModal(false);
                  addToast('Shift alteration request submitted', 'success');
                }}
                className="flex-1 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700">
                
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

}