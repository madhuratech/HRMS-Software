import React, { useState } from 'react';
import { Download, Calendar, ChevronDown, Plus, Eye, ArrowUpRight, ArrowDownRight, Layers, FileText, CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Data for Line Chart (Claims Over Time)
const CLAIMS_OVER_TIME = [
  { day: 'May 1-5', claims: 12 },
  { day: 'May 6-10', claims: 24 },
  { day: 'May 11-15', claims: 18 },
  { day: 'May 16-20', claims: 28 },
  { day: 'May 21-25', claims: 22 },
  { day: 'May 26-31', claims: 16 },
];

// Data for Donut Chart (Claims by Status)
const STATUS_PIE = [
  { name: 'Approved', value: 98, percent: '62.0%', color: '#2563EB' },
  { name: 'Pending',  value: 28, percent: '17.7%', color: '#10B981' },
  { name: 'Rejected', value: 32, percent: '20.3%', color: '#EF4444' },
];

// Data for Horizontal Bar Chart (Top Claim Amount by Department)
const DEPT_BARS = [
  { name: 'Sales',       amount: 645620, formatted: '₹ 6,45,620' },
  { name: 'Engineering', amount: 580450, formatted: '₹ 5,80,450' },
  { name: 'Marketing',   amount: 425300, formatted: '₹ 4,25,300' },
  { name: 'Operations',  amount: 325150, formatted: '₹ 3,25,150' },
  { name: 'HR',          amount: 215800, formatted: '₹ 2,15,800' },
  { name: 'Finance',     amount: 145300, formatted: '₹ 1,45,300' },
  { name: 'Others',      amount: 121050, formatted: '₹ 1,21,050' },
];

// Main Table Data
const RECENT_CLAIMS = [
  { id: 'CLM00158', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', emp: 'Rohit Sharma',  dept: 'Sales',       purpose: 'Client meeting - Mumbai',      date: '31 May 2024', amount: '₹ 12,450', status: 'Approved' },
  { id: 'CLM00157', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', emp: 'Priya Patel',   dept: 'Marketing',   purpose: 'Team lunch',                  date: '30 May 2024', amount: '₹ 2,850',  status: 'Pending'  },
  { id: 'CLM00156', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', emp: 'Amit Kumar',   dept: 'Engineering', purpose: 'Travel to Bangalore',         date: '30 May 2024', amount: '₹ 6,750',  status: 'Approved' },
  { id: 'CLM00155', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', emp: 'Sneha Reddy',  dept: 'HR',          purpose: 'Office supplies purchase',   date: '29 May 2024', amount: '₹ 1,250',  status: 'Approved' },
  { id: 'CLM00154', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', emp: 'Vikram Singh', dept: 'Operations',  purpose: 'Client dinner',               date: '28 May 2024', amount: '₹ 4,560',  status: 'Rejected' },
];

const KpiCard = ({ label, value, subtext, isPositive, iconBg, iconColor, icon: Icon }) => (
  <div style={{
    background: '#FFF',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 4px rgba(15,23,42,.06)',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
        {subtext && (
          <span style={{ fontSize: 10, fontWeight: 600, color: isPositive ? '#16A34A' : '#DC2626', display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' }}>
            {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {subtext}
          </span>
        )}
      </div>
    </div>
  </div>
);

export function ExpenseClaims() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* ── BREADCRUMB & HEADER & TOOLBAR ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Expense Claims</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Track and manage all employee expense claims</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Date Picker */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px',
            background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer',
          }}>
            <Calendar size={14} color="#6B7280" /> May 1 – May 31, 2024 <ChevronDown size={13} color="#6B7280" />
          </button>

          {/* Department Select */}
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
              <option>Operations</option>
              <option>HR</option>
              <option>Finance</option>
            </select>
            <ChevronDown size={13} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Export Button */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px',
            background: '#FFF', border: '1px solid #2563EB', color: '#2563EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Download size={14} /> Export
          </button>

          {/* Primary Action Button */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
            background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
          }}>
            <Plus size={16} /> New Claim
          </button>
        </div>
      </div>

      {/* ── 5 KPI CARDS IN A SINGLE ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Claims"       value="158"          subtext="12.5% vs last month" isPositive={true}  iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Pending Claims"     value="28"           subtext="8.4% vs last month"  isPositive={true}  iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Approved Claims"    value="98"           subtext="15.3% vs last month" isPositive={true}  iconBg="#ECFDF5" iconColor="#059669" icon={CheckCircle} />
        <KpiCard label="Rejected Claims"    value="32"           subtext="6.2% vs last month"  isPositive={false} iconBg="#FEF2F2" iconColor="#EF4444" icon={XCircle} />
        <KpiCard label="Total Claim Amount" value="₹ 24,58,750" subtext="11.8% vs last month" isPositive={true}  iconBg="#EFF6FF" iconColor="#2563EB" icon={Layers} />
      </div>

      {/* ── 3 ANALYTICS WIDGETS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px 1.2fr', gap: 20, marginBottom: 20, alignItems: 'stretch' }}>
        
        {/* Left: Claims Over Time Line Chart */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Claims Over Time</h3>
            <select style={{ fontSize: 11, color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 6, padding: '2px 6px', background: '#FFF', cursor: 'pointer' }}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div style={{ width: '100%', height: 180, flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CLAIMS_OVER_TIME} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Line type="monotone" dataKey="claims" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Center: Claims by Status Donut Chart */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Claims by Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
            <div style={{ width: 140, height: 140, position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={STATUS_PIE} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" stroke="none">
                    {STATUS_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1 }}>158</span>
                <span style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Total</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STATUS_PIE.map((item, i) => (
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

        {/* Right: Top Claim Amount by Department Bar Chart */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Top Claim Amount by Department</h3>
          <div style={{ width: '100%', height: 180, flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={DEPT_BARS} margin={{ top: 0, right: 30, left: 25, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `${val / 100000}L`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#374151' }} width={75} />
                <Tooltip formatter={(val) => `₹ ${val.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Bar dataKey="amount" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── MAIN DATA TABLE: Recent Expense Claims ── */}
      <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Recent Expense Claims</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                {['Claim ID', 'Employee', 'Department', 'Purpose', 'Claim Date', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_CLAIMS.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.id}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#111827', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={r.avatar} alt={r.emp} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontWeight: 500 }}>{r.emp}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.dept}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.purpose}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.amount}</td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: r.status === 'Approved' ? '#ECFDF5' : r.status === 'Pending' ? '#FEF3C7' : '#FEF2F2',
                      color: r.status === 'Approved' ? '#059669' : r.status === 'Pending' ? '#D97706' : '#EF4444',
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <button style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4, borderRadius: 4 }}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF' }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Showing 1 to 5 of 158 entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: 28, height: 28, borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                  background: currentPage === page ? '#2563EB' : '#F3F4F6',
                  color: currentPage === page ? '#FFF' : '#374151',
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default ExpenseClaims;
