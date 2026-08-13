import React from 'react';
import { Search, Filter, Download, Plus, MoreVertical, Receipt, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock Data
const kpiData = [
  { title: 'Pending Claims', value: '42', icon: <Receipt size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
  { title: 'Approved Claims', value: '128', icon: <CheckCircle size={20} color="#10B981" />, bgColor: '#ECFDF5' },
  { title: 'Rejected Claims', value: '14', icon: <XCircle size={20} color="#EF4444" />, bgColor: '#FEF2F2' },
  { title: 'Total Amount', value: '₹ 4.2L', icon: <DollarSign size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
];

const tableData = [
  { id: 1, name: 'Siddharth Rao', type: 'Travel', amount: '₹ 15,400', date: '12 Oct 2026', approver: 'Anita Desai', status: 'Approved' },
  { id: 2, name: 'Priya Sharma', type: 'Internet', amount: '₹ 1,500', date: '14 Oct 2026', approver: '-', status: 'Pending' },
  { id: 3, name: 'Vikram Singh', type: 'Client Dinner', amount: '₹ 8,200', date: '10 Oct 2026', approver: 'Rajesh Kumar', status: 'Rejected' },
  { id: 4, name: 'Neha Gupta', type: 'Office Supplies', amount: '₹ 4,500', date: '15 Oct 2026', approver: '-', status: 'Pending' },
  { id: 5, name: 'Amit Patel', type: 'Travel', amount: '₹ 22,000', date: '08 Oct 2026', approver: 'Anita Desai', status: 'Approved' },
];

const pieData = [
  { name: 'Travel', value: 45, color: '#2952E3' },
  { name: 'Meals & Ent', value: 25, color: '#10B981' },
  { name: 'Office Supplies', value: 15, color: '#F59E0B' },
  { name: 'Internet/Phone', value: 10, color: '#8B5CF6' },
  { name: 'Other', value: 5, color: '#94A3B8' },
];

export default function Reimbursements() {
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
              placeholder="Search Claim..."
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Filter size={16} /> Expense Type
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Download size={16} /> Export
          </button>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Plus size={16} /> Add Claim
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

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>

        {/* Main Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Recent Reimbursements</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Employee</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Expense Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Amount</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Submitted Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Approved By</th>
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
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.date}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.approver}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: row.status === 'Approved' ? '#ECFDF5' : row.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB',
                        color: row.status === 'Approved' ? '#10B981' : row.status === 'Rejected' ? '#EF4444' : '#F59E0B'
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

        {/* Right Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Expense Categories</h3>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              {pieData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
