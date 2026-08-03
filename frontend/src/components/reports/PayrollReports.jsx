import React from 'react';
import { Download, Calendar, ChevronDown, Users, Layers } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PAYROLL_DEPT = [
  { name: 'Engineering',      labelVal: '₹ 48,00,000', percent: '38.46%', color: '#2563EB', value: 4800000 },
  { name: 'Sales & Marketing',labelVal: '₹ 28,00,000', percent: '22.43%', color: '#3B82F6', value: 2800000 },
  { name: 'Finance',          labelVal: '₹ 18,00,000', percent: '14.42%', color: '#60A5FA', value: 1800000 },
  { name: 'Operations',       labelVal: '₹ 16,00,000', percent: '12.82%', color: '#818CF8', value: 1600000 },
  { name: 'HR',               labelVal: '₹ 9,00,000',  percent: '7.21%',  color: '#A78BFA', value: 900000  },
  { name: 'IT',               labelVal: '₹ 5,00,000',  percent: '4.01%',  color: '#F59E0B', value: 500000  },
  { name: 'Support',          labelVal: '₹ 5,80,000',  percent: '4.65%',  color: '#9CA3AF', value: 580000  },
];

const PAYROLL_SUMMARY = [
  { dept: 'Engineering',     emp: 72,  cost: '₹ 48,00,000',      net: '₹ 41,60,000',      ded: '₹ 4,80,000',  tax: '₹ 1,60,000' },
  { dept: 'Sales & Marketing', emp: 42, cost: '₹ 26,00,000',     net: '₹ 22,40,000',      ded: '₹ 2,80,000',  tax: '₹ 80,000'   },
  { dept: 'Finance',         emp: 28,  cost: '₹ 18,00,000',      net: '₹ 15,60,000',      ded: '₹ 1,80,000',  tax: '₹ 60,000'   },
  { dept: 'Operations',      emp: 36,  cost: '₹ 16,00,000',      net: '₹ 13,60,000',      ded: '₹ 1,70,000',  tax: '₹ 70,000'   },
  { dept: 'Human Resources', emp: 32,  cost: '₹ 7,80,000',       net: '₹ 6,80,000',       ded: '₹ 80,000',    tax: '₹ 40,000'   },
  { dept: 'IT',              emp: 20,  cost: '₹ 5,00,000',       net: '₹ 4,30,000',       ded: '₹ 50,000',    tax: '₹ 20,000'   },
  { dept: 'Support',         emp: 18,  cost: '₹ 5,80,000',       net: '₹ 4,40,000',       ded: '₹ 70,000',    tax: '₹ 20,000'   },
];

/* ── KPI Card: icon left, label small, value big – matches screenshot ── */
const KpiCard = ({ label, value, icon: Icon }) => (
  <div style={{
    background: '#fff',
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
      background: '#EFF6FF', color: '#2563EB',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={16} />
    </div>
    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={value}>{value}</div>
    </div>
  </div>
);

export function PayrollReports() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: '0' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Payroll Reports</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Payroll summary and analytics</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Date range */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px',
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
            fontSize: 13, color: '#374151', cursor: 'pointer',
          }}>
            <Calendar size={14} color="#6B7280" />
            May 1 – May 31, 2024
            <ChevronDown size={13} color="#6B7280" />
          </button>

          {/* Dept filter */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none',
              height: 38, paddingLeft: 14, paddingRight: 32,
              background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: 8, fontSize: 13, color: '#374151',
              cursor: 'pointer', outline: 'none',
            }}>
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Human Resources</option>
              <option>Finance</option>
            </select>
            <ChevronDown size={13} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Export button */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 38, padding: '0 16px',
            background: '#fff', border: '1px solid #2563EB',
            color: '#2563EB', borderRadius: 8, fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* ── 6 KPI CARDS IN A SINGLE ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Employees"   value="248"             icon={Users}  />
        <KpiCard label="Total Payroll Cost" value="₹ 1,24,80,000" icon={Layers} />
        <KpiCard label="Net Pay"           value="₹ 1,08,30,000"  icon={Layers} />
        <KpiCard label="Deductions"        value="₹ 16,50,000"    icon={Layers} />
        <KpiCard label="Taxes"             value="₹ 11,00,000"    icon={Layers} />
        <KpiCard label="Avg. Salary"       value="₹ 50,323"       icon={Layers} />
      </div>

      {/* ── MAIN ROW: Donut + Table ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Left – Payroll by Department Donut */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Payroll by Department</h3>

          {/* Donut */}
          <div style={{ width: '100%', height: 180, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PAYROLL_DEPT}
                  cx="50%" cy="50%"
                  innerRadius={54} outerRadius={76}
                  dataKey="value"
                  stroke="none"
                >
                  {PAYROLL_DEPT.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹ ${(val / 100000).toFixed(2)}L`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1 }}>₹ 1.24 Cr</span>
              <span style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>Total</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 14 }}>
            {PAYROLL_DEPT.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#374151' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  {item.name}
                </span>
                <span style={{ color: '#6B7280', fontWeight: 500 }}>{item.labelVal} ({item.percent})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right – Payroll Summary by Department Table */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Payroll Summary by Department</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                  {['Project', 'Employees', 'Payroll Cost', 'Net Pay', 'Deductions', 'Taxes'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px', textAlign: 'left',
                      fontSize: 12, fontWeight: 600, color: '#374151',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAYROLL_SUMMARY.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 44 }}>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}>{r.dept}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.emp}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.cost}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.net}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.ded}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.tax}</td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr style={{ background: '#FAFAFA', borderTop: '2px solid #E5E7EB', height: 44 }}>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Total</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>248</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>₹ 1,34,80,000</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>₹ 1,08,30,000</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>₹ 16,50,000</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>₹ 11,00,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PayrollReports;
