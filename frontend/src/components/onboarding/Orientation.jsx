import React from 'react';
import { Calendar, CheckCircle, Users, Percent, Plus, Info, Shield, CheckSquare, Presentation } from 'lucide-react';

const kpiData = [
  { title: 'Upcoming Sessions', value: '8', icon: <Calendar size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
  { title: 'Completed Sessions', value: '15', icon: <CheckCircle size={20} color="#10B981" />, bgColor: '#ECFDF5' },
  { title: 'Total Attendees', value: '45', icon: <Users size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
  { title: 'Avg. Attendance', value: '92%', icon: <Percent size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
];

const sessionsData = [
  { id: 1, title: 'Company Overview', date: '22 May 2024', time: '10:00 AM', venue: 'Conference Room A', trainer: 'Arjun Mehta', attendees: 12, status: 'Upcoming' },
  { id: 2, title: 'HR Policies', date: '23 May 2024', time: '11:00 AM', venue: 'Conference Room B', trainer: 'Sneha Kapoor', attendees: 10, status: 'Upcoming' },
  { id: 3, title: 'IT Systems Training', date: '24 May 2024', time: '02:00 PM', venue: 'Online (Zoom)', trainer: 'Rohan Verma', attendees: 15, status: 'Upcoming' },
  { id: 4, title: 'Code of Conduct', date: '25 May 2024', time: '10:30 AM', venue: 'Conference Room A', trainer: 'Neha Singh', attendees: 8, status: 'Completed' },
  { id: 5, title: 'Security Awareness', date: '27 May 2024', time: '03:00 PM', venue: 'Online (Zoom)', trainer: 'Vikram Singh', attendees: 10, status: 'Upcoming' },
];

const topicsData = [
  { name: 'Company Overview', icon: <Presentation size={16} /> },
  { name: 'HR Policies', icon: <Info size={16} /> },
  { name: 'IT Systems Training', icon: <Calendar size={16} /> },
  { name: 'Code of Conduct', icon: <Shield size={16} /> },
  { name: 'Security Awareness', icon: <CheckCircle size={16} /> },
  { name: 'Role & Responsibilities', icon: <Users size={16} /> },
];

export default function Orientation() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#ECFDF5', text: '#10B981', border: '#A7F3D0' };
      case 'Upcoming': return { bg: '#EFF6FF', text: '#2952E3', border: '#BFDBFE' };
      default: return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif', paddingBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Orientation</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Schedule and manage orientation sessions</p>
        </div>
        <div>
          <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Plus size={18} /> Schedule Session
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {kpiData.map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, display: 'flex', gap: '16px', padding: '20px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500', marginBottom: '4px' }}>{kpi.title}</div>
              <div style={{ fontSize: '24px', color: '#1E293B', fontWeight: '700' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Orientation Schedule</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Session Title</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Time</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Venue/Link</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Trainer</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Attendees</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessionsData.map((row, index) => (
                  <tr key={row.id} style={{ borderBottom: index === sessionsData.length - 1 ? 'none' : '1px solid #F8FAFC', transition: 'background 0.2s', ':hover': { background: '#F8FAFC' } }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '500', color: '#334155', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Presentation size={14} color="#64748B" />
                        </div>
                        {row.title}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.date}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.time}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.venue}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.trainer}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#1E293B', textAlign: 'center' }}>{row.attendees}</td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        backgroundColor: getStatusStyle(row.status).bg, 
                        color: getStatusStyle(row.status).text,
                        border: `1px solid ${getStatusStyle(row.status).border}`
                      }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            <button style={{ background: 'none', border: 'none', color: '#2952E3', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View Full Schedule</button>
          </div>

        </div>

        {/* Right Side: Topics Widget */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Orientation Topics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {topicsData.map((topic, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#64748B' }}>{topic.icon}</div>
                  <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{topic.name}</span>
                </div>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#2952E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckSquare size={12} color="#FFF" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
