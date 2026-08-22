import React, { useState } from 'react';
import { Search, Eye, Download, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';

const docsData = [
  { id: 1, empId: 'EMP001', name: 'Rahul Sharma', dept: 'Engineering', docType: 'PAN Card', date: '20 May 2024', status: 'Pending' },
  { id: 2, empId: 'EMP002', name: 'Priya Patel', dept: 'Human Resources', docType: 'Aadhar Card', date: '19 May 2024', status: 'Pending' },
  { id: 3, empId: 'EMP003', name: 'Amit Kumar', dept: 'Design', docType: 'Educational Certificate', date: '18 May 2024', status: 'Verified' },
  { id: 4, empId: 'EMP004', name: 'Neha Singh', dept: 'Finance', docType: 'Experience Letter', date: '17 May 2024', status: 'Pending' },
  { id: 5, empId: 'EMP005', name: 'Vikas Yadav', dept: 'Marketing', docType: 'Address Proof', date: '16 May 2024', status: 'Rejected' },
  { id: 6, empId: 'EMP006', name: 'Pooja Joshi', dept: 'Sales', docType: 'Bank Passbook', date: '15 May 2024', status: 'Verified' },
];

const pieData = [
  { name: 'Verified', value: 85, color: '#10B981' },
  { name: 'Pending', value: 24, color: '#F59E0B' },
  { name: 'Rejected', value: 6, color: '#EF4444' },
];

export default function DocumentVerification() {
  const [activeTab, setActiveTab] = useState('Pending Verification');

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Verified': return { bg: '#ECFDF5', text: '#10B981', border: '#A7F3D0' };
      case 'Pending': return { bg: '#FFFBEB', text: '#F59E0B', border: '#FDE68A' };
      case 'Rejected': return { bg: '#FEF2F2', text: '#EF4444', border: '#FECACA' };
      default: return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif', paddingBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Document Verification</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Verify and track employee documents</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #E2E8F0', paddingBottom: '0' }}>
        {['Pending Verification', 'Verified Documents', 'Rejected Documents'].map((tab) => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              paddingBottom: '12px', 
              fontSize: '14px', 
              fontWeight: activeTab === tab ? '600' : '500', 
              color: activeTab === tab ? '#2952E3' : '#64748B', 
              borderBottom: activeTab === tab ? '2px solid #2952E3' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Main Left Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '13px', color: '#334155', outline: 'none', cursor: 'pointer', minWidth: '160px' }}>
              <option>All Departments</option>
            </select>
            <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '13px', color: '#334155', outline: 'none', cursor: 'pointer', minWidth: '160px' }}>
              <option>All Document Types</option>
            </select>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search employee..." 
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Employee</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Document Type</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Submitted On</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docsData.map((row, index) => (
                    <tr key={row.id} style={{ borderBottom: index === docsData.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                            {row.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{row.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{row.dept}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#2952E3', fontWeight: '500', whiteSpace: 'nowrap' }}>{row.docType}</td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.date}</td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          backgroundColor: getStatusStyle(row.status).bg, 
                          color: getStatusStyle(row.status).text,
                          border: `1px solid ${getStatusStyle(row.status).border}`
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><Eye size={16} /></button>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><Download size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Verification Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '180px', height: '180px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" cx="50%" cy="50%" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label value="115" position="center" fill="#1E293B" style={{ fontSize: '28px', fontWeight: '700' }} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '64%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', color: '#64748B' }}>Total</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', marginTop: '24px' }}>
                {pieData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '500' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }}></div>
                      {item.name}
                    </div>
                    <div style={{ fontWeight: '600', color: '#1E293B' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={20} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Missing Documents</div>
                <div style={{ fontSize: '18px', color: '#1E293B', fontWeight: '700' }}>14</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
