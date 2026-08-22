import React from 'react';
import { Download, Calendar, ChevronDown, ArrowUpRight, Layers, FileText, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';

const MONTHLY_EXPENSES = [
  { month: 'Dec \'23', amount: 1400000 },
  { month: 'Jan \'24', amount: 1800000 },
  { month: 'Feb \'24', amount: 1600000 },
  { month: 'Mar \'24', amount: 2100000 },
  { month: 'Apr \'24', amount: 2000000 },
  { month: 'May \'24', amount: 2458750 },
];

const CAT_PIE = [
  { name: 'Travel',               value: 1110350, percent: '45.2%', color: '#2563EB' },
  { name: 'Meals',                value: 459800,  percent: '18.7%', color: '#10B981' },
  { name: 'Accommodation',        value: 351600,  percent: '14.3%', color: '#3B82F6' },
  { name: 'Office Supplies',      value: 211400,  percent: '8.6%',  color: '#F59E0B' },
  { name: 'Client Entertainment', value: 152250,  percent: '6.2%',  color: '#818CF8' },
  { name: 'Others',               value: 173350,  percent: '7.0%',  color: '#9CA3AF' },
];

const DEPT_BARS = [
  { name: 'Sales',       amount: 645620 },
  { name: 'Engineering', amount: 580450 },
  { name: 'Marketing',   amount: 425300 },
  { name: 'Operations',  amount: 325150 },
  { name: 'HR',          amount: 215800 },
  { name: 'Finance',     amount: 145300 },
  { name: 'Others',      amount: 121050 },
];

const SUMMARY_ROWS = [
  { metric: 'Total Claims',       amount: '₹ 24,58,750', pct: '100%'  },
  { metric: 'Total Approved',     amount: '₹ 20,45,300', pct: '83.2%' },
  { metric: 'Total Rejected',     amount: '₹ 1,12,850',  pct: '4.6%'  },
  { metric: 'Total Reimbursements',amount: '₹ 9,35,450',  pct: '38.1%' },
  { metric: 'Total Paid',         amount: '₹ 7,25,000',  pct: '29.5%' },
  { metric: 'Pending Amount',     amount: '₹ 2,48,000',  pct: '10.1%' },
];

const KpiCard = ({ label, value, subtext, iconBg, iconColor, icon: Icon }) => (
  <div style={{
    background: '#FFF',
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
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
        {subtext && (
          <span style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' }}>
            <ArrowUpRight size={10} /> {subtext}
          </span>
        )}
      </div>
    </div>
  </div>
);

export function ExpenseReports() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Expense Reports</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Comprehensive expense analytics and reporting</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px',
            background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer',
          }}>
            <Calendar size={14} color="#6B7280" /> May 1 – May 31, 2024 <ChevronDown size={13} color="#6B7280" />
          </button>

          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none', height: 38,
              paddingLeft: 14, paddingRight: 32, background: '#FFF',
              border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Departments</option>
              <option>Sales</option>
              <option>Engineering</option>
              <option>Marketing</option>
            </select>
            <ChevronDown size={13} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px',
            background: '#FFF', border: '1px solid #2563EB', color: '#2563EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* 5 KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Expenses"       value="₹ 24,58,750" subtext="12.5% vs last month" iconBg="#EFF6FF" iconColor="#2563EB" icon={Layers} />
        <KpiCard label="Total Claims"         value="158"          subtext="12.5% vs last month" iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Total Reimbursements" value="56"           subtext="8.3% vs last month"  iconBg="#EFF6FF" iconColor="#2563EB" icon={Clock} />
        <KpiCard label="Total Approved"       value="₹ 20,45,300" subtext="9.5% vs last month"  iconBg="#ECFDF5" iconColor="#059669" icon={CheckCircle} />
        <KpiCard label="Avg. Monthly Expense" value="₹ 5,760"     subtext="8.7% vs last month"  iconBg="#ECFDF5" iconColor="#059669" icon={Layers} />
      </div>

      {/* 4 Analytics Grid Widgets (2x2) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        
        {/* Widget 1: Monthly Expense Trend Bar Chart */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Monthly Expense Trend</h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_EXPENSES} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `${val / 100000}L`} />
                <Tooltip formatter={(val) => `₹ ${val.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 2: Expenses by Category Donut Chart */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Expenses by Category</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 160, height: 160, position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CAT_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" stroke="none">
                    {CAT_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(val) => `₹ ${val.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1 }}>₹ 24.58L</span>
                <span style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Total</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CAT_PIE.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    {item.name}
                  </span>
                  <span style={{ color: '#6B7280', fontWeight: 500 }}>{item.percent} (₹ {item.value.toLocaleString('en-IN')})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 3: Expenses by Department Horizontal Bar Chart */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Expenses by Department</h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={DEPT_BARS} margin={{ top: 0, right: 30, left: 25, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `${val / 100000}L`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#374151' }} width={75} />
                <Tooltip formatter={(val) => `₹ ${val.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Bar dataKey="amount" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 4: Expense Summary Table */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Expense Summary</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Metric</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Amount (₹)</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {SUMMARY_ROWS.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 32 }}>
                  <td style={{ padding: '0 12px', fontSize: 12, fontWeight: 500, color: '#111827' }}>{r.metric}</td>
                  <td style={{ padding: '0 12px', fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{r.amount}</td>
                  <td style={{ padding: '0 12px', fontSize: 12, color: '#6B7280', textAlign: 'right' }}>{r.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

export default ExpenseReports;
