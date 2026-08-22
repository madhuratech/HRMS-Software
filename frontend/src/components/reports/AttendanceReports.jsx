import React from 'react';
import { Download, Calendar, ChevronDown, Users, UserCheck, Clock, UserX } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';

const PRIMARY = '#2563EB';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';
const DANGER  = '#EF4444';

const TREND_LINE = [
  { date: '01 May', Present: 200, Absent: 20, Late: 18, HalfDay: 10 },
  { date: '05 May', Present: 205, Absent: 18, Late: 15, HalfDay: 10 },
  { date: '11 May', Present: 198, Absent: 24, Late: 16, HalfDay: 10 },
  { date: '16 May', Present: 210, Absent: 15, Late: 14, HalfDay: 9 },
  { date: '21 May', Present: 202, Absent: 21, Late: 15, HalfDay: 10 },
  { date: '26 May', Present: 212, Absent: 16, Late: 12, HalfDay: 8 },
  { date: '31 May', Present: 200, Absent: 20, Late: 18, HalfDay: 10 },
];

const DEPT_ATTENDANCE = [
  { dept: 'Engineering', pct: 92.35 },
  { dept: 'Human Resources', pct: 91.20 },
  { dept: 'Sales & Marketing', pct: 90.50 },
  { dept: 'Finance', pct: 93.10 },
  { dept: 'Operations', pct: 90.00 },
  { dept: 'IT', pct: 90.75 },
  { dept: 'Support', pct: 89.40 },
];

const ATTENDANCE_SUMMARY = [
  { dept: 'Engineering', total: 72, present: 61, absent: 6, late: 3, half: 2, pct: '92.35%' },
  { dept: 'Human Resources', total: 32, present: 29, absent: 2, late: 1, half: 0, pct: '91.20%' },
  { dept: 'Sales & Marketing', total: 42, present: 38, absent: 2, late: 1, half: 1, pct: '90.50%' },
  { dept: 'Finance', total: 28, present: 25, absent: 1, late: 1, half: 1, pct: '93.10%' },
  { dept: 'Operations', total: 36, present: 30, absent: 3, late: 2, half: 1, pct: '90.00%' },
  { dept: 'IT', total: 20, present: 18, absent: 1, late: 1, half: 0, pct: '90.75%' },
  { dept: 'Support', total: 18, present: 15, absent: 2, late: 0, half: 1, pct: '89.40%' },
];

const TOP_ABSENTEES = [
  { name: 'Rohit Sharma', dept: 'Engineering', days: 5 },
  { name: 'Priya Patel', dept: 'HR', days: 4 },
  { name: 'Amit Kumar', dept: 'Sales & Marketing', days: 3 },
  { name: 'Neha Singh', dept: 'Finance', days: 3 },
  { name: 'Vikram Singh', dept: 'IT', days: 3 },
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

export function AttendanceReports() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Attendance Reports</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Track and analyze employee attendance</p>
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
        <KpiCard label="Total Employees" value="248" iconBg="#DBEAFE" iconColor="#2563EB" icon={Users} />
        <KpiCard label="Present" value="200" pct="80.65%" iconBg="#DCFCE7" iconColor="#16A34A" icon={UserCheck} />
        <KpiCard label="Absent" value="20" pct="8.06%" iconBg="#FEE2E2" iconColor="#DC2626" icon={UserX} />
        <KpiCard label="Late" value="18" pct="7.26%" iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Half Day" value="10" pct="4.03%" iconBg="#FEE2E2" iconColor="#DC2626" icon={Clock} />
        <KpiCard label="Avg. Attendance" value="92.42%" iconBg="#DCFCE7" iconColor="#16A34A" icon={UserCheck} />
      </div>

      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20, marginBottom: 20 }}>
        
        {/* Attendance Overview Trend */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Attendance Overview</h3>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_LINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} domain={[0, 250]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Present" stroke={PRIMARY} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Absent" stroke={SUCCESS} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Late" stroke={WARNING} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="HalfDay" stroke={DANGER} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance by Department Horizontal Bar */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Attendance by Department</h3>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_ATTENDANCE} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis dataKey="dept" type="category" tick={{ fill: '#374151', fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="pct" fill={PRIMARY} barSize={12} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Attendance Summary Table & Top Absentees */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Attendance Summary</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                  {['Department', 'Total Employees', 'Present', 'Absent', 'Late', 'Half Day', 'Attendance %'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ATTENDANCE_SUMMARY.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 40 }}>
                    <td style={{ padding: '0 14px', fontSize: 12, fontWeight: 600, color: '#111827' }}>{r.dept}</td>
                    <td style={{ padding: '0 14px', fontSize: 12, color: '#374151' }}>{r.total}</td>
                    <td style={{ padding: '0 14px', fontSize: 12, color: '#374151' }}>{r.present}</td>
                    <td style={{ padding: '0 14px', fontSize: 12, color: '#374151' }}>{r.absent}</td>
                    <td style={{ padding: '0 14px', fontSize: 12, color: '#374151' }}>{r.late}</td>
                    <td style={{ padding: '0 14px', fontSize: 12, color: '#374151' }}>{r.half}</td>
                    <td style={{ padding: '0 14px', fontSize: 12, fontWeight: 600, color: SUCCESS }}>{r.pct}</td>
                  </tr>
                ))}
                <tr style={{ height: 42, fontWeight: 700, background: '#FAFAFA', borderTop: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>Total</td>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>248</td>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>214</td>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>17</td>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>8</td>
                  <td style={{ padding: '0 14px', fontSize: 12, color: '#111827' }}>3</td>
                  <td style={{ padding: '0 14px', fontSize: 12, color: SUCCESS }}>92.42%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Absentees Widget */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Top Absentees</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOP_ABSENTEES.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FEE2E2', color: DANGER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                    {item.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: '#6B7280' }}>{item.dept}</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: DANGER }}>{item.days}</span>
              </div>
            ))}
          </div>
          <button style={{ marginTop: 16, width: '100%', border: 'none', background: 'none', color: PRIMARY, fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
            View All Absentees →
          </button>
        </div>

      </div>

    </div>
  );
}

export default AttendanceReports;
