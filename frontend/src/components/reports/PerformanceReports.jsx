import React from 'react';
import { Download, Calendar, ChevronDown, Users, Award, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PERF_RATING_PIE = [
  { name: 'Outstanding',          value: 32,  percent: '12.90%', color: '#2563EB' },
  { name: 'Exceeds Expectations', value: 68,  percent: '27.42%', color: '#10B981' },
  { name: 'Meets Expectations',   value: 102, percent: '41.13%', color: '#059669' },
  { name: 'Needs Improvement',    value: 32,  percent: '12.90%', color: '#F59E0B' },
  { name: 'Unsatisfactory',       value: 14,  percent: '5.65%',  color: '#EF4444' },
];

const PERF_SUMMARY = [
  { dept: 'Engineering',     avg: '4.12', out: 12, exc: 18, meets: 30, needs: 8, un: 4 },
  { dept: 'Sales & Marketing', avg: '3.85', out: 8,  exc: 16, meets: 18, needs: 6, un: 2 },
  { dept: 'Finance',          avg: '3.90', out: 4,  exc: 10, meets: 12, needs: 4, un: 2 },
  { dept: 'Operations',       avg: '3.70', out: 3,  exc: 8,  meets: 16, needs: 6, un: 3 },
  { dept: 'IT',               avg: '4.00', out: 3,  exc: 8,  meets: 10, needs: 2, un: 1 },
  { dept: 'Human Resources',  avg: '3.92', out: 2,  exc: 6,  meets: 8,  needs: 2, un: 1 },
  { dept: 'Support',          avg: '3.60', out: 0,  exc: 2,  meets: 8,  needs: 4, un: 1 },
];

const KpiCard = ({ label, value, pct, iconBg, iconColor, icon: Icon }) => (
  <div style={{
    background: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 4px rgba(15,23,42,.06)',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    minWidth: 0,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: iconBg, color: iconColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={16} />
    </div>
    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
        {pct && <span style={{ fontSize: 10, color: '#6B7280', whiteSpace: 'nowrap' }}>{pct}</span>}
      </div>
    </div>
  </div>
);

export function PerformanceReports() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: '0' }}>
      
      {/* ── HEADER & TOOLBAR ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Performance Reports</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Employee performance overview</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Date range picker */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px',
            background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer',
          }}>
            <Calendar size={14} color="#6B7280" /> May 1 – May 31, 2024 <ChevronDown size={13} color="#6B7280" />
          </button>

          {/* Department selector */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none', height: 38,
              paddingLeft: 14, paddingRight: 32, background: '#FFF',
              border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Sales & Marketing</option>
              <option>Finance</option>
              <option>Operations</option>
              <option>IT</option>
              <option>Human Resources</option>
              <option>Support</option>
            </select>
            <ChevronDown size={13} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Export button */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px',
            background: '#FFF', border: '1px solid #2563EB', color: '#2563EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* ── 6 KPI CARDS IN SINGLE ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Employees"      value="248"      iconBg="#EFF6FF" iconColor="#2563EB" icon={Users} />
        <KpiCard label="Outstanding"          value="32"       pct="12.90%" iconBg="#F0FDF4" iconColor="#16A34A" icon={Sparkles} />
        <KpiCard label="Exceeds Expectations" value="68"       pct="27.42%" iconBg="#ECFDF5" iconColor="#059669" icon={UserCheck} />
        <KpiCard label="Meets Expectations"   value="102"      pct="41.13%" iconBg="#ECFDF5" iconColor="#10B981" icon={UserCheck} />
        <KpiCard label="Needs Improvement"   value="32"       pct="12.90%" iconBg="#FEF2F2" iconColor="#EF4444" icon={AlertCircle} />
        <KpiCard label="Average Rating"       value="3.82 / 5" iconBg="#ECFDF5" iconColor="#059669" icon={Award} />
      </div>

      {/* ── MAIN CONTENT: DONUT + TABLE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* Left – Performance Rating Distribution Donut */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Performance Rating Distribution</h3>
          
          {/* Donut Chart */}
          <div style={{ width: '100%', height: 180, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PERF_RATING_PIE} cx="50%" cy="50%" innerRadius={54} outerRadius={76} dataKey="value" stroke="none">
                  {PERF_RATING_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1 }}>248</span>
              <span style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>Total</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            {PERF_RATING_PIE.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  {item.name}
                </span>
                <span style={{ color: '#6B7280', fontWeight: 500 }}>{item.value} ({item.percent})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right – Performance by Department Table */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Performance by Department</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                  {['Department', 'Avg. Rating', 'Outstanding', 'Exceeds', 'Meets', 'Needs Improv.', 'Unsatisfactory'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERF_SUMMARY.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 44 }}>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}>{r.dept}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{r.avg}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.out}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.exc}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.meets}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.needs}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.un}</td>
                  </tr>
                ))}
                {/* Total / Overall Row */}
                <tr style={{ background: '#FAFAFA', borderTop: '2px solid #E5E7EB', height: 44 }}>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Overall</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>3.82</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>32</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>68</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>102</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>32</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>14</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

export default PerformanceReports;
