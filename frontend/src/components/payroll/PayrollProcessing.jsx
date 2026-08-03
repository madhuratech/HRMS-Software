import React from 'react';
import { Play, Calendar, Filter, Users, FileText, CheckCircle2, Circle, ArrowRight, IndianRupee } from 'lucide-react';

// Mock Data
const kpiData = [
  { title: 'Employees Processed', value: '450 / 480', icon: <Users size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
  { title: 'Pending Payroll', value: '30', icon: <FileText size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
  { title: 'Gross Payroll', value: '₹ 45.2L', icon: <IndianRupee size={20} color="#10B981" />, bgColor: '#ECFDF5' },
  { title: 'Net Payroll', value: '₹ 38.8L', icon: <IndianRupee size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
];

const workflowSteps = [
  { step: 1, name: 'Attendance Verification', status: 'completed' },
  { step: 2, name: 'Leave Calculation', status: 'completed' },
  { step: 3, name: 'Overtime Calculation', status: 'completed' },
  { step: 4, name: 'Salary Calculation', status: 'in-progress' },
  { step: 5, name: 'Tax Calculation', status: 'pending' },
  { step: 6, name: 'Payroll Completed', status: 'pending' },
];

const tableData = [
  { id: 1, dept: 'Engineering', emp: 145, gross: '₹ 15,20,000', net: '₹ 12,80,000', status: 'Processed' },
  { id: 2, dept: 'Sales', emp: 82, gross: '₹ 6,40,000', net: '₹ 5,30,000', status: 'Processed' },
  { id: 3, dept: 'Marketing', emp: 45, gross: '₹ 3,80,000', net: '₹ 3,20,000', status: 'Processed' },
  { id: 4, dept: 'Customer Support', emp: 120, gross: '₹ 5,60,000', net: '₹ 4,90,000', status: 'Pending' },
  { id: 5, dept: 'Human Resources', emp: 15, gross: '₹ 1,80,000', net: '₹ 1,50,000', status: 'Pending' },
];

export default function PayrollProcessing() {
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
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Calendar size={16} /> October 2026
          </button>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Filter size={16} /> All Departments
          </button>
        </div>
        <div>
          <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            <Play size={16} /> Process Payroll
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

      {/* Workflow Progress */}
      <div style={{ ...cardStyle, padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Payroll Workflow</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          
          <div style={{ position: 'absolute', top: '16px', left: '40px', right: '40px', height: '2px', background: '#E2E8F0', zIndex: 1 }}></div>

          {workflowSteps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, background: '#FFF', padding: '0 10px' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step.status === 'completed' ? '#10B981' : step.status === 'in-progress' ? '#2952E3' : '#F1F5F9',
                color: step.status === 'pending' ? '#94A3B8' : '#FFF',
                border: step.status === 'pending' ? '2px solid #E2E8F0' : 'none'
              }}>
                {step.status === 'completed' ? <CheckCircle2 size={20} /> : <span style={{ fontSize: '14px', fontWeight: '600' }}>{step.step}</span>}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: step.status === 'pending' ? '#94A3B8' : '#1E293B', textAlign: 'center', maxWidth: '100px' }}>
                {step.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Main Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Department Summary</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Department</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Employees</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Gross Salary</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Net Salary</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>{row.dept}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.emp}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{row.gross}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '600' }}>{row.net}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        backgroundColor: row.status === 'Processed' ? '#ECFDF5' : '#FFFBEB', 
                        color: row.status === 'Processed' ? '#10B981' : '#F59E0B' 
                      }}>
                        {row.status}
                      </span>
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
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Payroll Checklist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { name: 'Attendance Completed', status: 'done' },
                { name: 'Leave Approved', status: 'done' },
                { name: 'Salary Generated', status: 'pending' },
                { name: 'Payslips Ready', status: 'pending' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.status === 'done' ? (
                    <CheckCircle2 size={18} color="#10B981" />
                  ) : (
                    <Circle size={18} color="#CBD5E1" />
                  )}
                  <div style={{ fontSize: '14px', color: item.status === 'done' ? '#334155' : '#64748B', fontWeight: item.status === 'done' ? '500' : '400' }}>
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
            
            <button style={{ width: '100%', marginTop: '24px', padding: '10px 0', borderRadius: '8px', border: '1px solid #2952E3', background: '#EFF6FF', color: '#2952E3', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              Review Anomalies
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
