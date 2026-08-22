import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, UserMinus, Calendar, Clock, Percent, ChevronDown } from 'lucide-react';

const trendData = [
  { name: '1 May', casual: 40, sick: 24, privilege: 24, earned: 15 },
  { name: '6 May', casual: 30, sick: 13, privilege: 22, earned: 20 },
  { name: '11 May', casual: 20, sick: 48, privilege: 22, earned: 18 },
  { name: '16 May', casual: 27, sick: 39, privilege: 20, earned: 28 },
  { name: '21 May', casual: 18, sick: 48, privilege: 21, earned: 19 },
  { name: '26 May', casual: 23, sick: 38, privilege: 25, earned: 25 },
  { name: '31 May', casual: 34, sick: 43, privilege: 21, earned: 21 },
];

const leaveDistribution = [
  { name: 'Casual Leave', value: 18, color: '#3b82f6' },
  { name: 'Sick Leave', value: 12, color: '#10b981' },
  { name: 'Privilege Leave', value: 10, color: '#f59e0b' },
  { name: 'Earned Leave', value: 8, color: '#8b5cf6' },
  { name: 'Maternity Leave', value: 4, color: '#ec4899' },
  { name: 'Others', value: 4, color: '#64748b' },
];

const departmentData = [
  { dept: 'Design', emp: 40, taken: 10, pending: 2 },
  { dept: 'Development', emp: 85, taken: 22, pending: 5 },
  { dept: 'Marketing', emp: 35, taken: 6, pending: 1 },
  { dept: 'Human Resources', emp: 20, taken: 4, pending: 1 },
  { dept: 'Finance', emp: 25, taken: 6, pending: 2 },
  { dept: 'Sales', emp: 40, taken: 6, pending: 1 },
];

const onLeaveToday = [
  { name: 'Priya Nair', role: 'UI/UX Designer', type: 'CL', color: '#3b82f6', bg: '#eff6ff' },
  { name: 'Rohan Mehta', role: 'Software Engineer', type: 'SL', color: '#10b981', bg: '#ecfdf5' },
  { name: 'Neha Patel', role: 'HR Executive', type: 'PL', color: '#f59e0b', bg: '#fffbeb' },
  { name: 'Aarav Sharma', role: 'Product Designer', type: 'EL', color: '#8b5cf6', bg: '#f5f3ff' },
  { name: 'Vikram Singh', role: 'Sales Executive', type: 'CL', color: '#3b82f6', bg: '#eff6ff' },
];

export default function LeaveDashboard() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <button style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#475569', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          This Month <ChevronDown size={14} /> <Calendar size={14} />
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {[
          { title: 'Total Employees', value: '245', icon: <Users size={20} color="#2952E3" />, bg: '#EEF2FF', border: 'none' },
          { title: 'On Leave Today', value: '18', icon: <UserMinus size={20} color="#2952E3" />, bg: '#EEF2FF', border: 'none' },
          { title: 'Leaves Taken', subtitle: 'This Month', value: '56', icon: <Calendar size={20} color="#2952E3" />, bg: '#EEF2FF', border: 'none' },
          { title: 'Pending Approval', value: '12', icon: <Clock size={20} color="#F59E0B" />, bg: '#FFFBEB', border: '1px solid #FCD34D' },
          { title: 'Leave Encashment', subtitle: 'This Month', value: '₹2.45L', icon: <Calendar size={20} color="#2952E3" />, bg: '#EEF2FF', border: 'none' }
        ].map((kpi, idx) => (
          <div key={idx} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: kpi.border || '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>{kpi.title}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', lineHeight: '1' }}>{kpi.value}</div>
              {kpi.subtitle && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{kpi.subtitle}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Monthly Leave Trend */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Leave Trend</h3>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} verticalAlign="top" align="center" />
                  <Line type="monotone" dataKey="casual" name="Casual Leave" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="sick" name="Sick Leave" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="privilege" name="Privilege Leave" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="earned" name="Earned Leave" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Summary Table */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Leave by Department</h3>
            </div>
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Department</th>
                    <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Employees</th>
                    <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Leaves Taken</th>
                    <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>{dept.dept}</td>
                      <td style={{ padding: '12px 24px', fontSize: '12px', color: '#475569', textAlign: 'center' }}>{dept.emp}</td>
                      <td style={{ padding: '12px 24px', fontSize: '12px', color: '#3b82f6', fontWeight: '600', textAlign: 'center' }}>{dept.taken}</td>
                      <td style={{ padding: '12px 24px', fontSize: '12px', color: '#475569', textAlign: 'center' }}>{dept.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Leave Type Distribution */}
          <div style={{ ...cardStyle, padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Leave Summary</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '130px', height: '130px', position: 'relative', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leaveDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                      {leaveDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>56</span>
                  <span style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: '1.2' }}>Total Leaves</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {leaveDistribution.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }}></div>
                      <span style={{ fontSize: '11px', color: '#475569', fontWeight: '500' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{item.value} ({(item.value / 56 * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's On Leave */}
          <div style={{ ...cardStyle, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Today's On Leave</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
              {onLeaveToday.map((emp, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=f1f5f9&color=64748b`} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>{emp.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{emp.role}</div>
                    </div>
                  </div>
                  <div style={{ padding: '4px 8px', borderRadius: '6px', background: emp.bg, color: emp.color, fontSize: '10px', fontWeight: '700' }}>
                    {emp.type}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '12px', color: '#2952E3', fontWeight: '600', cursor: 'pointer' }}>View All</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
