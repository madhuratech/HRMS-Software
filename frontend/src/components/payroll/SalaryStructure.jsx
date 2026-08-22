import React from 'react';
import { Plus, Edit2, Eye, Building2, CheckCircle2, Wallet, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const kpiData = [
  { title: 'Total Structures', value: '12', icon: <Building2 size={24} color="#2952E3" />, bgColor: '#EFF6FF' },
  { title: 'Active Structures', value: '8', icon: <CheckCircle2 size={24} color="#2952E3" />, bgColor: '#EFF6FF' },
  { title: 'Average CTC (LPA)', value: '₹ 8.5L', icon: <Wallet size={24} color="#8B5CF6" />, bgColor: '#F5F3FF' },
  { title: 'Employees Mapped', value: '245', icon: <Users size={24} color="#2952E3" />, bgColor: '#EFF6FF' },
];

const tableData = [
  { id: 1, name: 'Default Structure', code: 'STR-001', freq: 'Monthly', amount: '₹ 85,000', date: '01 Apr 2024', employees: 156, status: 'Active' },
  { id: 2, name: 'Manager Structure', code: 'STR-002', freq: 'Monthly', amount: '₹ 1,45,000', date: '01 Apr 2024', employees: 45, status: 'Active' },
  { id: 3, name: 'Sales Structure', code: 'STR-003', freq: 'Monthly', amount: '₹ 65,000', date: '01 May 2024', employees: 28, status: 'Active' },
  { id: 4, name: 'Intern Structure', code: 'STR-004', freq: 'Monthly', amount: '₹ 15,000', date: '01 Jun 2024', employees: 10, status: 'Inactive' },
  { id: 5, name: 'Executive Structure', code: 'STR-005', freq: 'Monthly', amount: '₹ 2,10,000', date: '01 Jul 2024', employees: 20, status: 'Active' },
  { id: 6, name: 'Hourly Structure', code: 'STR-006', freq: 'Hourly', amount: '₹ 800/hr', date: '01 Jul 2024', employees: 12, status: 'Inactive' },
];

export default function SalaryStructure() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0', background: '#F8FAFC', minHeight: '100%' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Salary Structure</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Manage and configure salary structures</p>
        </div>
        <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
          <Plus size={16} /> Add Structure
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {kpiData.map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '8px' }}>{kpi.title}</div>
              <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Structure Name</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Structure Code</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Monthly Salary</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Pay Frequency</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Effective From</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Employees</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={row.id} style={{ borderBottom: index === tableData.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                  <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap' }}>{row.name}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.code}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap' }}>{row.amount}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.freq}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.date}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.employees}</td>
                  <td style={{ padding: '20px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      backgroundColor: row.status === 'Active' ? '#ECFDF5' : '#FEF2F2', 
                      color: row.status === 'Active' ? '#10B981' : '#EF4444' 
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <button style={{ background: '#EFF6FF', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', color: '#2952E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={14} /></button>
                      <button style={{ background: '#EFF6FF', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', color: '#2952E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
          Showing 1 to 6 of 12 entries
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', color: '#64748B' }}>
            <ChevronLeft size={18} />
          </button>
          
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2952E3', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#FFF', fontSize: '14px', fontWeight: '500' }}>
            1
          </button>
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', color: '#64748B', fontSize: '14px', fontWeight: '500' }}>
            2
          </button>
          
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', color: '#64748B' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
