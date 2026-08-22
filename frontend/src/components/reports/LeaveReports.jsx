import React from 'react';
import { Download, Calendar, ChevronDown, Clock, UserCheck, UserX, Users, Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PRIMARY = '#2563EB';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';
const DANGER  = '#EF4444';

const LEAVE_TYPE = [
  { name: 'Casual Leave', value: 96, percent: '38.71%', color: '#2563EB' },
  { name: 'Sick Leave', value: 68, percent: '27.42%', color: '#10B981' },
  { name: 'Earned Leave', value: 52, percent: '20.97%', color: '#F59E0B' },
  { name: 'Maternity Leave', value: 20, percent: '8.06%', color: '#EC4899' },
  { name: 'Paternity Leave', value: 12, percent: '4.84%', color: '#818CF8' },
];

const LEAVE_SUMMARY = [
  { dept: 'Engineering', req: 32, app: 25, rej: 2, days: 64 },
  { dept: 'Human Resources', req: 16, app: 12, rej: 1, days: 28 },
  { dept: 'Sales & Marketing', req: 24, app: 20, rej: 2, days: 48 },
  { dept: 'Finance', req: 14, app: 10, rej: 3, days: 32 },
  { dept: 'Operations', req: 20, app: 15, rej: 2, days: 40 },
  { dept: 'IT', req: 12, app: 9, rej: 2, days: 24 },
  { dept: 'Support', req: 6, app: 5, rej: 0, days: 12 },
];

const KpiCard = ({ label, value, pct, iconBg, iconColor, icon: Icon }) => (
  <div style={{
    background: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB',
    boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: '16px 20px', flex: '1 1 0', minWidth: 140,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280' }}>{label}</span>
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
      {pct && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{pct}</div>}
    </div>
  </div>
);

export function LeaveReports() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Leave Reports</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Analyze employee leave data</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px',
            background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer',
          }}>
            <Calendar size={14} color="#6B7280" /> May 1 – May 31, 2024 <ChevronDown size={14} color="#6B7280" />
          </button>

          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none', height: 38,
              paddingLeft: 14, paddingRight: 32, background: '#FFF',
              border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Human Resources</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px',
            background: '#FFF', border: '1px solid #2563EB', color: '#2563EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards (6 Cards) */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard label="Total Leave Requests" value="124" iconBg="#DBEAFE" iconColor="#2563EB" icon={Users} />
        <KpiCard label="Approved" value="96" pct="77.42%" iconBg="#DCFCE7" iconColor="#16A34A" icon={UserCheck} />
        <KpiCard label="Pending" value="18" pct="14.52%" iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Rejected" value="10" pct="8.06%" iconBg="#FEE2E2" iconColor="#DC2626" icon={UserX} />
        <KpiCard label="Total Leave Days" value="248" iconBg="#DBEAFE" iconColor="#2563EB" icon={Users} />
        <KpiCard label="Avg. Leave Days/Emp" value="1.0" iconBg="#E0F2FE" iconColor="#0284C7" icon={Briefcase} />
      </div>

      {/* Analytics Row: Leave by Type + Leave Summary by Department */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>
        
        {/* Leave by Type Donut */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Leave by Type</h3>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 170, height: 170, position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={LEAVE_TYPE} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" stroke="none">
                    {LEAVE_TYPE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>248</span>
                <span style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Total Days</span>
              </div>
            </div>
            <div style={{ flex: 1, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LEAVE_TYPE.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} /> {item.name}
                  </span>
                  <span style={{ fontWeight: 500, color: '#6B7280' }}>{item.value} ({item.percent})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leave Summary by Department Table */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Leave Summary by Department</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                  {['Department', 'Total Requests', 'Approved', 'Rejected', 'Leave Days'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LEAVE_SUMMARY.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 38 }}>
                    <td style={{ padding: '0 14px', fontSize: 12, fontWeight: 600, color: '#111827' }}>{r.dept}</td>
                    <td style={{ padding: '0 14px', fontSize: 12, color: '#374151' }}>{r.req}</td>
                    <td style={{ padding: '0 14px', fontSize: 12, color: '#374151' }}>{r.app}</td>
                    <td style={{ padding: '0 14px', fontSize: 12, color: '#374151' }}>{r.rej}</td>
                    <td style={{ padding: '0 14px', fontSize: 12, color: '#374151' }}>{r.days}</td>
                  </tr>
                ))}
                <tr style={{ height: 40, fontWeight: 700, background: '#FAFAFA', borderTop: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>Total</td>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>124</td>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>96</td>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>10</td>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>248</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

export default LeaveReports;
