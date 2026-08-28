import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Loader2, AlertCircle, Crown, Building2, Mail, Phone, Star, UserCheck } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export function MyTeam() {
  const [loading, setLoading] = useState(true);
  const [noTeamAssigned, setNoTeamAssigned] = useState(false);
  const [teamInfo, setTeamInfo] = useState({ name: 'Developers', department: 'Software Development' });
  const [teamLeader, setTeamLeader] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/employees/team-members');
        if (res && res.noTeamAssigned) {
          setNoTeamAssigned(true);
          setTeamLeader(null);
          setMembers([]);
        } else if (res) {
          setNoTeamAssigned(false);
          if (res.team) {
            setTeamInfo({
              name: res.team.name || 'Developers',
              department: res.team.department || 'Software Development'
            });
          }
          if (res.teamLeader) setTeamLeader(res.teamLeader);
          setMembers(res.scopedMembers || res.members || []);
        }
      } catch (e) {
        console.error('Failed to fetch team data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = [
    ['#3B82F6', '#1D4ED8'], ['#8B5CF6', '#6D28D9'], ['#10B981', '#047857'],
    ['#F59E0B', '#B45309'], ['#EF4444', '#B91C1C'], ['#06B6D4', '#0E7490'],
  ];
  const getAvatarColor = (id) => avatarColors[(id || 0) % avatarColors.length];

  if (loading) {
    return (
      <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid #E2E8F0', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', letterSpacing: '0.01em' }}>Loading team roster...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (noTeamAssigned) {
    return (
      <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)',
          borderRadius: '20px', padding: '28px 32px', color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 12px 32px -4px rgba(37,99,235,0.30)'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>My Team</h1>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>No Team Assigned • Contact HR/Admin</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ShieldCheck size={15} /> Read-Only
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '48px 32px', textAlign: 'center', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', border: '1px solid #F1F5F9' }}>
          <div style={{ width: '60px', height: '60px', background: '#FEF3C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertCircle size={28} color="#D97706" />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>No Team Assigned</p>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Please contact HR/Admin to assign you to a team.</p>
        </div>
      </div>
    );
  }

  const leaderName = teamLeader?.name || '';
  const leaderEmail = teamLeader?.email || '';
  const leaderEmpId = teamLeader?.employeeId || (teamLeader ? `EMP${String(teamLeader.id).padStart(4, '0')}` : '');
  const leaderDesignation = teamLeader?.designation || 'Team Leader';
  const [lc1, lc2] = getAvatarColor(teamLeader?.id || 0);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)',
        borderRadius: '20px', padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 12px 32px -4px rgba(37,99,235,0.30)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: '-20px', top: '-30px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: '60px', bottom: '-40px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>My Team</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{teamInfo.name}</span>
            <span style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%' }} />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={12} /> {teamInfo.department}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1 }}>{members.length}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 600, marginTop: '2px' }}>MEMBERS</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ShieldCheck size={14} /> Read-Only
          </div>
        </div>
      </div>

      {/* ── Team Leader Card ── */}
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
        border: '1px solid #F1F5F9'
      }}>
        {/* Section label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div style={{ width: '3px', height: '18px', background: 'linear-gradient(180deg, #3B82F6, #6366F1)', borderRadius: '4px' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Team Leader</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Avatar */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px', flexShrink: 0,
              background: `linear-gradient(135deg, ${lc1}, ${lc2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 800, color: '#fff',
              boxShadow: `0 8px 20px -4px ${lc1}66`
            }}>
              {getInitials(leaderName)}
            </div>

            {/* Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                  {leaderName}
                </h3>
                <Crown size={14} color="#F59E0B" />
              </div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                {leaderDesignation}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {leaderEmail && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
                    <Mail size={11} /> {leaderEmail}
                  </span>
                )}
                {leaderEmpId && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#3B82F6', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px', letterSpacing: '0.04em' }}>
                    {leaderEmpId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
            border: '1px solid #A7F3D0', borderRadius: '12px',
            padding: '8px 16px'
          }}>
            <div style={{ width: '7px', height: '7px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#065F46' }}>Active Team Lead</span>
          </div>
        </div>
      </div>

      {/* ── Team Members Grid ── */}
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
        border: '1px solid #F1F5F9'
      }}>
        {/* Section label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '18px', background: 'linear-gradient(180deg, #10B981, #06B6D4)', borderRadius: '4px' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Team Members</span>
          </div>
          <span style={{
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
            padding: '4px 12px', fontSize: '13px', fontWeight: 700, color: '#475569'
          }}>
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        {members.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
            <div style={{ width: '48px', height: '48px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Users size={22} color="#CBD5E1" />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#94A3B8', margin: '0 0 4px' }}>No team members yet</p>
            <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>Members assigned to this team will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #F1F5F9' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Employee Name', 'Department', 'Employee ID', 'Email', 'Status'].map((col, i) => (
                    <th key={col} style={{
                      padding: '11px 16px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#64748B',
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid #E2E8F0',
                      whiteSpace: 'nowrap',
                      borderRight: i < 4 ? '1px solid #F1F5F9' : 'none'
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => {
                  const [c1, c2] = getAvatarColor(m.id || idx);
                  const isActive = (m.status || 'Active') === 'Active';
                  const isLast = idx === members.length - 1;
                  return (
                    <tr
                      key={m.id}
                      style={{ background: '#fff', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F0F7FF'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      {/* Name */}
                      <td style={{ padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                            background: `linear-gradient(135deg, ${c1}, ${c2})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 800, color: '#fff'
                          }}>
                            {getInitials(m.name)}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>{m.name}</span>
                        </div>
                      </td>
                      {/* Department */}
                      <td style={{ padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', fontSize: '13px', color: '#475569', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {m.department || m.dept_name || '—'}
                      </td>
                      {/* Employee ID */}
                      <td style={{ padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', padding: '3px 9px', borderRadius: '7px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                          {m.employeeId || `EMP${String(m.id).padStart(4, '0')}`}
                        </span>
                      </td>
                      {/* Email */}
                      <td style={{ padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', maxWidth: '200px' }}>
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.email || '—'}
                        </span>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid #F1F5F9' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          fontSize: '12px', fontWeight: 700,
                          color: isActive ? '#065F46' : '#64748B',
                          background: isActive ? '#ECFDF5' : '#F1F5F9',
                          border: `1px solid ${isActive ? '#A7F3D0' : '#E2E8F0'}`,
                          padding: '3px 10px', borderRadius: '8px', whiteSpace: 'nowrap'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10B981' : '#94A3B8', boxShadow: isActive ? '0 0 5px rgba(16,185,129,0.5)' : 'none', flexShrink: 0 }} />
                          {m.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default MyTeam;
