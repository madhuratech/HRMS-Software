import React from 'react';
import { Search, Plus, Filter, Download, Users, UserPlus, Clock, CheckCircle, Percent, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';

const kpiData = [
  { title: 'Total New Joiners', value: '45', trend: 'This Month', icon: <Users size={20} color="#10B981" />, bgColor: '#ECFDF5' },
  { title: 'Joined This Week', value: '12', icon: <UserPlus size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
  { title: 'Pending Tasks', value: '18', icon: <Clock size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
  { title: 'Completed Onboarding', value: '27', icon: <CheckCircle size={20} color="#10B981" />, bgColor: '#ECFDF5' },
  { title: 'Completion Rate', value: '60%', trend: '+12% vs last month', icon: <Percent size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
];

const joinersData = [
  { id: 'EMP001', name: 'Rahul Sharma', dept: 'Engineering', role: 'Software Developer', date: '20 May 2024', manager: 'Arjun Mehta', status: 'In Progress' },
  { id: 'EMP002', name: 'Priya Patel', dept: 'Human Resources', role: 'HR Executive', date: '18 May 2024', manager: 'Sneha Kapoor', status: 'In Progress' },
  { id: 'EMP003', name: 'Amit Kumar', dept: 'Design', role: 'UI/UX Designer', date: '15 May 2024', manager: 'Rohan Verma', status: 'Completed' },
  { id: 'EMP004', name: 'Neha Singh', dept: 'Finance', role: 'Accountant', date: '14 May 2024', manager: 'Vikram Singh', status: 'Completed' },
  { id: 'EMP005', name: 'Vikas Yadav', dept: 'Marketing', role: 'Marketing Executive', date: '10 May 2024', manager: 'Anjali Desai', status: 'Pending' },
  { id: 'EMP006', name: 'Pooja Joshi', dept: 'Sales', role: 'Sales Executive', date: '08 May 2024', manager: 'Karan Malhotra', status: 'In Progress' },
];

const pieData = [
  { name: 'Completed', value: 27, color: '#10B981' },
  { name: 'In Progress', value: 12, color: '#2952E3' },
  { name: 'Pending', value: 6, color: '#F59E0B' },
];

const deptData = [
  { name: 'Engineering', count: 18 },
  { name: 'Human Resources', count: 8 },
  { name: 'Finance', count: 6 },
  { name: 'Design', count: 5 },
  { name: 'Marketing', count: 5 },
  { name: 'Sales', count: 3 },
];

export default function NewJoiners() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#ECFDF5', text: '#10B981' };
      case 'In Progress': return { bg: '#FFFBEB', text: '#F59E0B' };
      case 'Pending': return { bg: '#FEF2F2', text: '#EF4444' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif', paddingBottom: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>New Joiners</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Manage and track newly joined employees</p>
        </div>
        <div>
          <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Plus size={18} /> Add New Joiner
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '20px' }}>
        {kpiData.map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement(kpi.icon, { size: 18 })}
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.title}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700', lineHeight: '1' }}>{kpi.value}</div>
              {kpi.trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: kpi.trend.includes('+') ? '#10B981' : '#64748B', background: kpi.trend.includes('+') ? '#ECFDF5' : '#F8FAFC', padding: '4px 8px', borderRadius: '20px', fontWeight: '600' }}>
                  {kpi.trend}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>

        {/* Left Side: Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap' }}>Recently Joined Employees</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '13px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
                <option>All Departments</option>
              </select>
              <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '13px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
                <option>All Status</option>
              </select>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search..."
                  style={{ width: '160px', padding: '8px 10px 8px 30px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Employee</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Department</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Designation</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Joining Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Reporting Manager</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Onboarding Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {joinersData.map((row, index) => (
                  <tr key={row.id} style={{ borderBottom: index === joinersData.length - 1 ? 'none' : '1px solid #F8FAFC', transition: 'background 0.2s', ':hover': { background: '#F8FAFC' } }}>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                          {row.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{row.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{row.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.dept}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.role}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.date}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.manager}</td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: getStatusStyle(row.status).bg,
                        color: getStatusStyle(row.status).text
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><MoreHorizontal size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
              Showing 1 to 6 of 45 entries
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
                <ChevronLeft size={16} />
              </button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2952E3', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FFF', fontSize: '13px', fontWeight: '500' }}>
                1
              </button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                2
              </button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Charts & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Donut Chart */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Onboarding Overview</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '120px', height: '120px', position: 'relative', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value" cx="50%" cy="50%" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label value="45" position="center" fill="#1E293B" style={{ fontSize: '24px', fontWeight: '700' }} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '70%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: '#64748B' }}>Total</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginLeft: '16px' }}>
                {pieData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '500', whiteSpace: 'nowrap' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }}></div>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ fontWeight: '600', color: '#1E293B' }}>{item.value}</span>
                      <span style={{ color: '#94A3B8' }}>({Math.round((item.value / 45) * 100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Wise Summary */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Department Wise Joiners</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {deptData.map((dept, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>{dept.name}</span>
                  <span style={{ fontSize: '14px', color: '#1E293B', fontWeight: '600' }}>{dept.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
