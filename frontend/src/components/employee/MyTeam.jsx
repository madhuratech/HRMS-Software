import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Mail, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export function MyTeam() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState({
    name: 'Software Development',
    department: 'Engineering',
    leadName: 'Alex Morgan',
    leadEmail: 'alex.morgan@hawkeye.com'
  });
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      try {
        // Fetch real database employees & metadata
        const res = await apiFetch('/projects/meta');
        if (res && res.success && res.data) {
          const emps = res.data.employees || [];
          setMembers(emps);
          if (emps.length > 0) {
            setTeam(prev => ({
              ...prev,
              leadName: emps[0].name || prev.leadName,
              leadEmail: emps[0].email || prev.leadEmail
            }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch team data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

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
        <p className="text-sm font-semibold text-slate-600">Loading team roster...</p>
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
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>My Team</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#DBEAFE' }}>
            {team.name} • {team.department}
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
          <ShieldCheck size={16} /> Read-Only View
        </div>
      </div>

      {/* Team Lead Card */}
      <div style={cardStyle} className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md flex-shrink-0">
            {team.leadName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
              Team Leader
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{team.leadName}</h3>
            <p className="text-xs text-slate-500">{team.leadEmail}</p>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
          Active Team Lead
        </span>
      </div>

      {/* Team Members Grid */}
      <div style={cardStyle}>
        <h3 className="text-base font-bold text-slate-900 mb-4">Team Members ({members.length})</h3>

        {members.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs">
            <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />
            No team members found in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(m => (
              <div key={m.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors flex items-center gap-3.5 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{m.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{m.designation || 'Team Member'}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m.employee_id || `EMP00${m.id}`}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default MyTeam;
