import React from 'react';
import { Search, Filter, Download, Plus, MoreVertical, FileText, FileX, Landmark, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data
const kpiData = [
  { title: 'Employees Filed', value: '410', icon: <FileText size={20} color="#10B981" />, bgColor: '#ECFDF5' },
  { title: 'Pending Declaration', value: '70', icon: <FileX size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
  { title: 'Tax Saved', value: '₹ 1.8 Cr', icon: <Landmark size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
  { title: 'Total Tax Collected', value: '₹ 5.4 Cr', icon: <TrendingDown size={20} color="#EF4444" />, bgColor: '#FEF2F2' },
];

const tableData = [
  { id: 1, name: 'Siddharth Rao', fy: '2026-27', regime: 'New Regime', income: '₹ 14,50,000', deduction: '₹ 1,20,000', status: 'Declared' },
  { id: 2, name: 'Priya Sharma', fy: '2026-27', regime: 'Old Regime', income: '₹ 8,40,000', deduction: '₹ 45,000', status: 'Verified' },
  { id: 3, name: 'Vikram Singh', fy: '2026-27', regime: 'New Regime', income: '₹ 22,00,000', deduction: '₹ 4,50,000', status: 'Declared' },
  { id: 4, name: 'Neha Gupta', fy: '2026-27', regime: 'Old Regime', income: '₹ 6,50,000', deduction: '₹ 12,000', status: 'Pending' },
  { id: 5, name: 'Amit Patel', fy: '2026-27', regime: 'New Regime', income: '₹ 11,20,000', deduction: '₹ 85,000', status: 'Verified' },
];

const areaData = [
  { month: 'Apr', Tax: 4200000 },
  { month: 'May', Tax: 4300000 },
  { month: 'Jun', Tax: 4400000 },
  { month: 'Jul', Tax: 4250000 },
  { month: 'Aug', Tax: 4600000 },
  { month: 'Sep', Tax: 4800000 },
];

export default function TaxManagement() {
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
            <Filter size={16} /> FY 2026-27
          </button>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Filter size={16} /> Regime
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Download size={16} /> Export Reports
          </button>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Plus size={16} /> Upload Form 16
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
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Tax Declarations</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Employee</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Financial Year</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Tax Regime</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Taxable Income</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Tax Deduction</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center', whiteSpace: 'nowrap' }}>Declaration Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap' }}>{row.name}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.fy}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#F1F5F9', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{row.regime}</span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>{row.income}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#EF4444', fontWeight: '600' }}>{row.deduction}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: row.status === 'Verified' ? '#ECFDF5' : row.status === 'Declared' ? '#EFF6FF' : '#FFFBEB',
                        color: row.status === 'Verified' ? '#10B981' : row.status === 'Declared' ? '#2952E3' : '#F59E0B'
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
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Income Tax Slab Summary (New)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Up to ₹ 3,00,000</span><span style={{ fontWeight: '600' }}>Nil</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>₹ 3,00,001 - ₹ 6,00,000</span><span style={{ fontWeight: '600' }}>5%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>₹ 6,00,001 - ₹ 9,00,000</span><span style={{ fontWeight: '600' }}>10%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>₹ 9,00,001 - ₹ 12,00,000</span><span style={{ fontWeight: '600' }}>15%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>₹ 12,00,001 - ₹ 15,00,000</span><span style={{ fontWeight: '600' }}>20%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Above ₹ 15,00,000</span><span style={{ fontWeight: '600' }}>30%</span>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Tax Deduction Trend</h3>
            <div style={{ height: '180px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} tickFormatter={(val) => `${val / 100000}L`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Tax" stroke="#EF4444" fillOpacity={1} fill="url(#colorTax)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
