import React from 'react';
import { Search, Filter, Download, Plus, MoreVertical, Layers, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data
const kpiData = [
  { title: 'Total Components', value: '24', icon: <Layers size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
  { title: 'Earnings', value: '14', icon: <TrendingUp size={20} color="#10B981" />, bgColor: '#ECFDF5' },
  { title: 'Deductions', value: '7', icon: <TrendingDown size={20} color="#EF4444" />, bgColor: '#FEF2F2' },
  { title: 'Employer Contributions', value: '3', icon: <Landmark size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
];

const tableData = [
  { id: 1, name: 'Basic Salary', type: 'Earning', taxable: 'Yes', formula: '40% of CTC', freq: 'Monthly', status: 'Active' },
  { id: 2, name: 'House Rent Allowance (HRA)', type: 'Earning', taxable: 'Partial', formula: '50% of Basic', freq: 'Monthly', status: 'Active' },
  { id: 3, name: 'Special Allowance', type: 'Earning', taxable: 'Yes', formula: 'Fixed Amount', freq: 'Monthly', status: 'Active' },
  { id: 4, name: 'Provident Fund (Employee)', type: 'Deduction', taxable: 'No', formula: '12% of Basic', freq: 'Monthly', status: 'Active' },
  { id: 5, name: 'Professional Tax', type: 'Deduction', taxable: 'No', formula: 'Slab Based', freq: 'Monthly', status: 'Active' },
  { id: 6, name: 'TDS', type: 'Deduction', taxable: 'No', formula: 'Tax Slab', freq: 'Monthly', status: 'Active' },
  { id: 7, name: 'Annual Bonus', type: 'Earning', taxable: 'Yes', formula: 'Performance Based', freq: 'Yearly', status: 'Active' },
];

const pieData = [
  { name: 'Earnings', value: 14, color: '#10B981' },
  { name: 'Deductions', value: 7, color: '#EF4444' },
  { name: 'Contributions', value: 3, color: '#F59E0B' },
];

export default function SalaryComponents() {
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
              placeholder="Search Components..."
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Filter size={16} /> Component Type
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Download size={16} /> Export
          </button>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Plus size={16} /> Add Component
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
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', height: '100%' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Salary Components</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Component Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Taxable</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Formula / Amount</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Frequency</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>{row.name}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: row.type === 'Earning' ? '#ECFDF5' : '#FEF2F2',
                        color: row.type === 'Earning' ? '#10B981' : '#EF4444'
                      }}>
                        {row.type}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.taxable}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.formula}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.freq}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: row.status === 'Active' ? '#ECFDF5' : '#FEF2F2',
                        color: row.status === 'Active' ? '#10B981' : '#EF4444'
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '60%' }}>
          <div style={{ ...cardStyle, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Component Distribution</h3>
            <div style={{ width: '100%', flex: 1, minHeight: '150px' }}>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
              {pieData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
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
