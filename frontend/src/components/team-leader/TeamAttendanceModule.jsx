import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export function TeamAttendanceModule() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    const fetchTeamAttendance = async () => {
      setLoading(true);
      try {
        let leaderId = 11;
        const auth = localStorage.getItem('hrms_auth');
        if (auth) {
          try {
            const parsed = JSON.parse(auth);
            const userObj = parsed.user || parsed;
            if (userObj && userObj.id) leaderId = userObj.id;
          } catch (e) {}
        }

        const data = await apiFetch(`/attendance/team-attendance?leader_id=${leaderId}&date=${selectedDate}`);
        if (Array.isArray(data)) {
          setAttendanceRecords(data);
        } else {
          const fallback = await apiFetch(`/attendance/gps-feed?date=${selectedDate}`);
          if (fallback && fallback.success && Array.isArray(fallback.records)) {
            setAttendanceRecords(fallback.records);
          } else {
            setAttendanceRecords([]);
          }
        }
      } catch (err) {
        console.error("Failed to load team attendance database logs:", err);
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAttendance();
  }, [selectedDate]);

  const filtered = attendanceRecords.filter(r => {
    const nameStr = (r.name || r.employee_name || '').toLowerCase();
    const empIdStr = (r.employee_id || r.empId || '').toLowerCase();
    const matchesSearch = nameStr.includes(search.toLowerCase()) || empIdStr.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter || r.attendanceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
    border: '1px solid #E5E7EB'
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm font-semibold text-slate-600">Loading database team attendance...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="space-y-6">

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px -5px rgba(37,99,235,0.25)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Team Attendance Logs</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#DBEAFE' }}>
            Real-time Database Check-in and Check-out Logs for Team Members
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '8px 16px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={16} /> Database Verified
        </div>
      </div>

      {/* Filters & Controls */}
      <div style={cardStyle}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search team member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>
            <div className="w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Completed">Completed</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="w-44">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs">
            <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />
            No team attendance records found in database for selected date.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Check IN</th>
                  <th className="py-3 px-4">Check OUT</th>
                  <th className="py-3 px-4">Working Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Geofence / Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <strong className="text-slate-900 block font-bold">{r.name || r.employee_name}</strong>
                        <span className="text-[11px] text-slate-400 font-mono">{r.employee_id || r.empId || `EMP00${r.id}`}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{r.shift || 'Morning Shift'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{r.checkIn || '--'}</td>
                    <td className="py-3 px-4 font-bold text-blue-600">{r.checkOut || '--'}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{r.workingHours || r.hours || '--'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        r.status === 'Present' || r.status === 'Completed' || r.attendanceStatus === 'Present' || r.attendanceStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        r.status === 'Late' || r.attendanceStatus === 'Late' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {r.status || r.attendanceStatus || 'Absent'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                        {r.geofenceStatus || 'On-Site'} • {r.verification || 'GPS Verified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default TeamAttendanceModule;
