import React from 'react';
import { Search, Filter, Download, Plus, MoreVertical, Gift, Clock, Award, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Label } from 'recharts';

// Mock Data
const kpiData = [
  { title: 'Total Bonus Paid', value: '₹ 12.5L', icon: <Gift size={20} color="#10B981" />, bgColor: '#ECFDF5' },
  { title: 'Pending Bonus', value: '₹ 3.2L', icon: <Clock size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
  { title: 'Total Incentives', value: '₹ 8.4L', icon: <Award size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
  { title: 'Performance Rewards', value: '₹ 4.1L', icon: <Star size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
];

const tableData = [
  { id: 1, name: 'Rahul Verma', type: 'Performance Bonus', rating: '5/5', amount: '₹ 1,50,000', status: 'Approved', date: '15 Oct 2026' },
  { id: 2, name: 'Anjali Rao', type: 'Sales Incentive', rating: '4.5/5', amount: '₹ 85,000', status: 'Paid', date: '01 Oct 2026' },
  { id: 3, name: 'Karan Singh', type: 'Festival Bonus', rating: 'N/A', amount: '₹ 25,000', status: 'Paid', date: '25 Sep 2026' },
  { id: 4, name: 'Megha Nair', type: 'Retention Bonus', rating: '4/5', amount: '₹ 2,00,000', status: 'Pending', date: '31 Oct 2026' },
  { id: 5, name: 'Sanjay Kumar', type: 'Performance Bonus', rating: '3.5/5', amount: '₹ 60,000', status: 'Approved', date: '15 Oct 2026' },
];

const barData = [
  { name: 'Engineering', Bonus: 400000, Incentive: 240000 },
  { name: 'Sales', Bonus: 300000, Incentive: 500000 },
  { name: 'Marketing', Bonus: 200000, Incentive: 150000 },
  { name: 'HR', Bonus: 150000, Incentive: 50000 },
];

const pieData = [
  { name: 'Performance', value: 45, color: '#2952E3' },
  { name: 'Sales Incentive', value: 30, color: '#10B981' },
  { name: 'Festival', value: 15, color: '#F59E0B' },
  { name: 'Retention', value: 10, color: '#8B5CF6' },
];

export default function BonusIncentives() {
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
            <Filter size={16} /> Bonus Type
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Download size={16} /> Export
          </button>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Plus size={16} /> Declare Bonus
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
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Department Performance Bonus</h3>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Bonus" fill="#2952E3" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Incentive" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Bonus Distribution</h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" cx="50%" cy="50%">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label 
                    value="600k" 
                    position="center" 
                    fill="#1E293B" 
                    style={{ fontSize: '24px', fontWeight: '700' }} 
                  />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            {pieData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Bonus & Incentive Records</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Employee</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Bonus Type</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Performance Rating</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Amount</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Payment Date</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>{row.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.type}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px' }}>
                      <Star size={14} color={row.rating !== 'N/A' ? '#F59E0B' : '#94A3B8'} fill={row.rating !== 'N/A' ? '#F59E0B' : 'none'} />
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>{row.rating}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{row.amount}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.date}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      backgroundColor: row.status === 'Paid' ? '#ECFDF5' : row.status === 'Approved' ? '#EFF6FF' : '#FFFBEB', 
                      color: row.status === 'Paid' ? '#10B981' : row.status === 'Approved' ? '#2952E3' : '#F59E0B' 
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
