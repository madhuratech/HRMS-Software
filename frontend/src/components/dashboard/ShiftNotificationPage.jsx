import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, ArrowRight, UserCheck, X } from 'lucide-react';
import { format, addDays } from 'date-fns';





export function ShiftNotificationPage({ onClose }) {
  const [notifications, setNotifications] = useState([
  {
    id: 1,
    type: 'SHIFT_CHANGE',
    title: 'Shift Change Request Approved',
    message: 'Your request to switch to the Morning Shift on Oct 25th has been approved by the manager.',
    date: '2023-10-24T14:30:00',
    read: false,
    status: 'APPROVED'
  },
  {
    id: 2,
    type: 'NEW_ROSTER',
    title: 'New Weekly Roster Published',
    message: 'The shift schedule for the week of Oct 30th - Nov 5th is now available for viewing.',
    date: '2023-10-23T09:00:00',
    read: true,
    status: 'INFO'
  },
  {
    id: 3,
    type: 'SHIFT_REMINDER',
    title: 'Upcoming Shift Reminder',
    message: 'Reminder: You have a Night Shift scheduled for tomorrow (Oct 26th) starting at 22:00.',
    date: '2023-10-25T08:00:00',
    read: false,
    status: 'WARNING'
  }]
  );

  const upcomingShifts = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(new Date(), i);
    const day = date.getDay();
    // Deterministic mock logic
    if (day === 0 || day === 6) return { date, type: 'OFF', label: 'Day Off', time: '-', color: 'bg-slate-100 text-slate-500' };
    const seed = date.getDate() % 3;
    if (seed === 0) return { date, type: 'MORNING', label: 'Morning', time: '08:00 - 16:00', color: 'bg-yellow-100 text-yellow-800' };
    if (seed === 1) return { date, type: 'AFTERNOON', label: 'Afternoon', time: '14:00 - 22:00', color: 'bg-orange-100 text-orange-800' };
    return { date, type: 'NIGHT', label: 'Night', time: '22:00 - 06:00', color: 'bg-indigo-100 text-indigo-800' };
  });

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto animate-in fade-in">
      <div className="max-w-3xl mx-auto min-h-screen p-6">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-50 py-4 z-10 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="text-blue-600" /> Shift Notifications
            </h1>
            <p className="text-slate-500 text-sm">Manage your schedule updates and requests</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Quick Schedule Overview */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>Upcoming Schedule</span>
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View Full Calendar</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {upcomingShifts.map((shift, idx) =>
              <div key={idx} className="flex flex-col items-center p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase mb-1">{format(shift.date, 'EEE')}</span>
                  <span className="text-lg font-bold text-slate-800 mb-2">{format(shift.date, 'd')}</span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold w-full text-center truncate ${shift.color}`}>
                    {shift.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-slate-400" />
              Recent Alerts
            </h3>
            <div className="space-y-4">
              {notifications.map((note) =>
              <div
                key={note.id}
                className={`bg-white p-5 rounded-xl border transition-all ${note.read ? 'border-slate-200 opacity-75' : 'border-blue-200 shadow-md border-l-4 border-l-blue-500'}`}
                onClick={() => markAsRead(note.id)}>
                
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-lg ${
                    note.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                    note.status === 'WARNING' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'}`
                    }>
                        {note.status === 'APPROVED' ? <UserCheck size={20} /> :
                      note.status === 'WARNING' ? <AlertCircle size={20} /> : <Calendar size={20} />}
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg mb-1 ${note.read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {note.title}
                          {!note.read && <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full align-middle"></span>}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3">
                          {note.message}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          {format(new Date(note.date), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    {/* Action Button */}
                    <button className="text-slate-300 hover:text-slate-500">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Request Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl mb-1">Need a Schedule Change?</h3>
              <p className="text-blue-100 text-sm opacity-90">Submit a request for shift swap or time off.</p>
            </div>
            <button className="px-5 py-2.5 bg-white text-blue-700 font-bold rounded-lg shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
              Request Change <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>);

}