import React from 'react';
import { Search, Filter, Download, Plus, MoreVertical, CreditCard, PiggyBank, CalendarClock, HandCoins } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

// Mock Data
const kpiData = [
  { title: 'Active Loans', value: '18', icon: <CreditCard size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
  { title: 'Total Loan Amount', value: '₹ 24.5L', icon: <PiggyBank size={20} color="#10B981" />, bgColor: '#ECFDF5' },
  { title: 'Monthly EMI Collection', value: '₹ 1.2L', icon: <CalendarClock size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
  { title: 'Outstanding Balance', value: '₹ 16.8L', icon: <HandCoins size={20} color="#EF4444" />, bgColor: '#FEF2F2' },
];

const tableData = [
  { id: 1, name: 'Siddharth Rao', type: 'Personal Loan', amount: '₹ 2,00,000', emi: '₹ 12,000', out: '₹ 1,40,000', next: '05 Nov 2026', status: 'Active' },
  { id: 2, name: 'Priya Sharma', type: 'Salary Advance', amount: '₹ 50,000', emi: '₹ 10,000', out: '₹ 20,000', next: '05 Nov 2026', status: 'Active' },
  { id: 3, name: 'Vikram Singh', type: 'Home Loan', amount: '₹ 15,00,000', emi: '₹ 45,000', out: '₹ 12,50,000', next: '05 Nov 2026', status: 'Active' },
  { id: 4, name: 'Neha Gupta', type: 'Medical Emergency', amount: '₹ 1,50,000', emi: '₹ 8,000', out: '₹ 0', next: '-', status: 'Closed' },
  { id: 5, name: 'Amit Patel', type: 'Salary Advance', amount: '₹ 30,000', emi: '₹ 15,000', out: '₹ 30,000', next: '05 Nov 2026', status: 'Pending Approval' },
];

const pieData = [
  { name: 'Personal Loan', value: 45, color: '#2952E3' },
  { name: 'Home Loan', value: 35, color: '#10B981' },
  { name: 'Salary Advance', value: 15, color: '#F59E0B' },
  { name: 'Medical', value: 5, color: '#EF4444' },
];

const barData = [
  { month: 'Jun', EMI: 90000 },
  { month: 'Jul', EMI: 105000 },
  { month: 'Aug', EMI: 110000 },
  { month: 'Sep', EMI: 115000 },
  { month: 'Oct', EMI: 120000 },
];

export default function LoansAdvances() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Employee..."
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Filter size={16} /> Loan Type
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Download size={16} /> Export
          </button>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Plus size={16} /> New Loan Request
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {kpiData.map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '4px' }}>{kpi.title}</div>
              <div style={{ fontSize: '24px', color: '#1E293B', fontWeight: '700' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Monthly EMI Collection</h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="EMI" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Loan Distribution by Type</h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Main Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Loans & Advances Records</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Employee</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Loan Type</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Loan Amount</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>EMI</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Outstanding</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Next EMI Date</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>{row.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.type}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{row.amount}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.emi}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#EF4444', fontWeight: '500' }}>{row.out}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.next}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: row.status === 'Active' ? '#ECFDF5' : row.status === 'Closed' ? '#F1F5F9' : '#FFFBEB',
                      color: row.status === 'Active' ? '#10B981' : row.status === 'Closed' ? '#64748B' : '#F59E0B'
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
