import React, { useState } from 'react';
import { Calendar, ChevronDown, Download, FileText, CheckCircle, Clock, Star } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis } from 'recharts';

const TICKETS_OVER_TIME = [
  { day: 'May 1-5', tickets: 240 },
  { day: 'May 6-10', tickets: 310 },
  { day: 'May 11-15', tickets: 280 },
  { day: 'May 16-20', tickets: 360 },
  { day: 'May 21-25', tickets: 312 },
  { day: 'May 26-31', tickets: 260 },
];

const CAT_PIE = [
  { name: 'IT Support',         value: 482, percent: '38.6%', color: '#2563EB' },
  { name: 'HR Support',         value: 312, percent: '25.0%', color: '#10B981' },
  { name: 'Payroll',            value: 198, percent: '15.9%', color: '#3B82F6' },
  { name: 'Leave & Attendance', value: 156, percent: '12.5%', color: '#F59E0B' },
  { name: 'Others',             value: 100, percent: '8.0%',  color: '#9CA3AF' },
];

const SLA_PIE = [
  { name: 'Met',      value: 980, percent: '78.5%', color: '#10B981' },
  { name: 'Breached', value: 166, percent: '13.3%', color: '#EF4444' },
  { name: 'Warning',  value: 102, percent: '8.2%',  color: '#F59E0B' },
];

const DETAILED_REPORT = [
  { cat: 'IT Support',         total: 482, open: 98, progress: 124, pending: 84, resolved: 176, overdue: 24, avgResp: '18m 20s', avgRes: '18h 30m', sat: 4.6 },
  { cat: 'HR Support',         total: 312, open: 60, progress: 80,  pending: 40, resolved: 132, overdue: 18, avgResp: '24m 10s', avgRes: '21h 45m', sat: 4.5 },
  { cat: 'Payroll',            total: 198, open: 32, progress: 45,  pending: 28, resolved: 93,  overdue: 12, avgResp: '2h 05m',  avgRes: '36h 10m', sat: 4.4 },
  { cat: 'Leave & Attendance', total: 156, open: 28, progress: 35,  pending: 18, resolved: 75,  overdue: 10, avgResp: '1h 15m',  avgRes: '28h 20m', sat: 4.7 },
  { cat: 'Others',             total: 100, open: 15, progress: 28,  pending: 15, resolved: 42,  overdue: 8,  avgResp: '3h 20m',  avgRes: '42h 15m', sat: 4.3 },
];

const KpiCard = ({ label, value, iconBg, iconColor, icon: Icon }) => (
  <div style={{
    background: '#FFF',
    borderRadius: 14,
    border: '1px solid #E5E7EB',
    boxShadow: '0 2px 8px rgba(15,23,42,.04)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: '1 1 0',
    minWidth: 0,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: iconBg, color: iconColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={18} />
    </div>
    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
    </div>
  </div>
);

export function HelpDeskReports() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* ── HEADER & TOOLBAR ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Reports</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Analyze and export help desk reports</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px',
            background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer',
          }}>
            <Calendar size={14} color="#6B7280" /> May 1 – May 31, 2024 <ChevronDown size={13} color="#6B7280" />
          </button>

          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px',
            background: '#FFF', border: '1px solid #2563EB', color: '#2563EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Download size={14} /> Export Report
          </button>

          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
            background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
          }}>
            Generate Report
          </button>
        </div>
      </div>

      {/* ── 5 KPI CARDS IN A SINGLE ROW ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Tickets"        value="1,248"  iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Resolved Tickets"     value="987"    iconBg="#ECFDF5" iconColor="#059669" icon={CheckCircle} />
        <KpiCard label="Avg Response Time"    value="2h 34m" iconBg="#EFF6FF" iconColor="#2563EB" icon={Clock} />
        <KpiCard label="Avg Resolution Time"  value="18h 30m"iconBg="#EFF6FF" iconColor="#2563EB" icon={Clock} />
        <KpiCard label="Satisfaction Score"   value="4.6 / 5"iconBg="#FEF3C7" iconColor="#D97706" icon={Star} />
      </div>

      {/* ── TOP ROW: 3 ANALYTICS CHARTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
        
        {/* Left: Tickets Over Time Line */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Tickets Over Time</h3>
            <select style={{ fontSize: 11, color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 6, padding: '2px 6px', background: '#FFF', cursor: 'pointer' }}>
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TICKETS_OVER_TIME} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Line type="monotone" dataKey="tickets" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Center: Tickets by Category Donut */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Tickets by Category</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 120, height: 120, position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CAT_PIE} cx="50%" cy="50%" innerRadius={36} outerRadius={52} dataKey="value" stroke="none">
                    {CAT_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1 }}>1,248</span>
                <span style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Total</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {CAT_PIE.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#374151' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    {item.name}
                  </span>
                  <span style={{ color: '#6B7280', fontWeight: 500 }}>{item.value} ({item.percent})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: SLA Performance Donut */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>SLA Performance</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 120, height: 120, position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SLA_PIE} cx="50%" cy="50%" innerRadius={36} outerRadius={52} dataKey="value" stroke="none">
                    {SLA_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1 }}>1,248</span>
                <span style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Total</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SLA_PIE.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    {item.name}
                  </span>
                  <span style={{ color: '#6B7280', fontWeight: 500 }}>{item.value} ({item.percent})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── MAIN DATA TABLE: Detailed Report Table ── */}
      <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Detailed Report</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                {['Category', 'Total Tickets', 'Open', 'In Progress', 'Pending', 'Resolved', 'Overdue', 'Avg Response Time', 'Avg Resolution Time', 'Satisfaction Score'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DETAILED_REPORT.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.cat}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.total}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#EF4444', whiteSpace: 'nowrap' }}>{r.open}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#D97706', whiteSpace: 'nowrap' }}>{r.progress}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#818CF8', whiteSpace: 'nowrap' }}>{r.pending}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#059669', whiteSpace: 'nowrap' }}>{r.resolved}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#DC2626', whiteSpace: 'nowrap' }}>{r.overdue}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.avgResp}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.avgRes}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.sat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF' }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Showing 1 to 5 of 5 entries</span>
        </div>
      </div>

    </div>
  );
}

export default HelpDeskReports;
