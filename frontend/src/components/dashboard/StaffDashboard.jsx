import React, { useState, useEffect } from 'react';
import { CheckCircle, Target, TrendingUp, Bell, X, CalendarDays } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { OnboardingStatusWidget } from './OnboardingStatusWidget';
import { ShiftNotificationPage } from './ShiftNotificationPage';

const WEEKLY_ATTENDANCE = [
{ day: 'Mon', hours: 8.5 },
{ day: 'Tue', hours: 9.0 },
{ day: 'Wed', hours: 8.2 },
{ day: 'Thu', hours: 8.8 },
{ day: 'Fri', hours: 7.5 } // Early leave
];

export function StaffDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShiftPage, setShowShiftPage] = useState(false);
  const currentUserId = 'e4'; // Hardcoded for prototype: David Kim

  useEffect(() => {
    // Function to load notifications
    const loadNotifications = () => {
      const stored = localStorage.getItem(`notifications_${currentUserId}`);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    };

    // Initial load
    loadNotifications();

    // Listen for storage events (updates from other components)
    window.addEventListener('storage', loadNotifications);

    // Cleanup
    return () => window.removeEventListener('storage', loadNotifications);
  }, []);

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`notifications_${currentUserId}`, JSON.stringify(updated));
  };

  const clearNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(`notifications_${currentUserId}`, JSON.stringify(updated));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (showShiftPage) {
    return <ShiftNotificationPage onClose={() => setShowShiftPage(false)} />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
            JD
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Welcome back, John!</h2>
            <p className="text-slate-500 text-sm">Service Staff • Downtown Branch</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowShiftPage(true)}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm border border-indigo-200 flex items-center gap-2 hover:bg-indigo-100 transition-colors">
            
            <CalendarDays size={18} />
            My Shifts
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="px-4 py-2 bg-white text-slate-700 font-bold rounded-lg text-sm border border-slate-200 flex items-center gap-2 hover:bg-slate-50 relative">
              
              <Bell size={18} />
              {unreadCount > 0 &&
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              }
            </button>

            {/* Notifications Dropdown */}
            {showNotifications &&
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ?
                <div className="p-8 text-center text-slate-500 text-sm">
                      No new notifications
                    </div> :

                <div className="divide-y divide-slate-50">
                      {notifications.map((note) =>
                  <div key={note.id} className={`p-4 hover:bg-slate-50 transition-colors ${!note.read ? 'bg-blue-50/50' : ''}`}>
                          <div className="flex justify-between items-start gap-3">
                            <div onClick={() => markAsRead(note.id)} className="flex-1 cursor-pointer">
                              <p className={`text-sm ${!note.read ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                                {note.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <button
                        onClick={() => clearNotification(note.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors">
                        
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                  )}
                    </div>
                }
                </div>
              </div>
            }
          </div>
          
          <button className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg text-sm border border-green-200 flex items-center gap-2">
            <CheckCircle size={16} /> Punched In (09:00 AM)
          </button>
        </div>
      </div>

      {/* Onboarding Status - Visible for new employees */}
      <OnboardingStatusWidget status="VERIFICATION_PENDING" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Target size={20} /></div>
              <span className="text-xs font-bold text-slate-400 uppercase">Monthly Target</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">82%</h3>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">12 tasks remaining to hit bonus</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
              <span className="text-xs font-bold text-slate-400 uppercase">Incentives</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">$450</h3>
            <p className="text-sm text-green-600 font-medium mt-1">+ $120 this week</p>
            <p className="text-xs text-slate-500 mt-2">Next payout: Nov 1st</p>
          </div>
        </div>

        {/* Pending Tasks Mini View */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm row-span-2">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
            Assigned Tasks
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">3 Pending</span>
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) =>
            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500">#JOB-29{i}</span>
                  <span className="text-xs text-orange-600 font-medium">High Priority</span>
                </div>
                <h4 className="font-bold text-slate-700 text-sm">Brake System Overhaul</h4>
                <p className="text-xs text-slate-400 mt-1">Due Today, 5:00 PM</p>
              </div>
            )}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
            View All Tasks
          </button>
        </div>

        {/* Attendance Chart */}
        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Weekly Attendance</h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height={200} minWidth={0}>
              <BarChart data={WEEKLY_ATTENDANCE}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>);

}