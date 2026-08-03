import React from 'react';
import { Monitor, CheckCircle, Clock, RotateCcw, Plus, Search, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';

const kpiData = [
  { title: 'Total Assets', value: '120', icon: <Monitor size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
  { title: 'Allocated This Month', value: '25', icon: <CheckCircle size={20} color="#10B981" />, bgColor: '#ECFDF5' },
  { title: 'Pending Allocation', value: '15', icon: <Clock size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
  { title: 'Returned Assets', value: '80', icon: <RotateCcw size={20} color="#64748B" />, bgColor: '#F1F5F9' },
];

const assetsData = [
  { id: 'EMP001', name: 'Rahul Sharma', dept: 'Engineering', assets: 'Laptop, Mouse, ID Card', date: '20 May 2024', by: 'Arjun Mehta', status: 'Allocated' },
  { id: 'EMP002', name: 'Priya Patel', dept: 'Human Resources', assets: 'Laptop, ID Card', date: '19 May 2024', by: 'Sneha Kapoor', status: 'Allocated' },
  { id: 'EMP003', name: 'Amit Kumar', dept: 'Design', assets: 'Laptop, Pen Tablet, ID Card', date: '18 May 2024', by: 'Rohan Verma', status: 'Allocated' },
  { id: 'EMP004', name: 'Neha Singh', dept: 'Finance', assets: 'Laptop, Calculator, ID Card', date: '17 May 2024', by: 'Vikram Singh', status: 'Pending' },
  { id: 'EMP005', name: 'Vikas Yadav', dept: 'Marketing', assets: 'Laptop, Headset, ID Card', date: '16 May 2024', by: 'Anjali Desai', status: 'Pending' },
  { id: 'EMP006', name: 'Pooja Joshi', dept: 'Sales', assets: 'Laptop, Mobile, ID Card', date: '15 May 2024', by: 'Karan Malhotra', status: 'Allocated' },
];

const pieData = [
  { name: 'Allocated', value: 80, color: '#2952E3' },
  { name: 'Pending', value: 15, color: '#F59E0B' },
  { name: 'Returned', value: 25, color: '#64748B' },
];

const summaryData = [
  { name: 'Laptop', count: 45 },
  { name: 'Mobile', count: 20 },
  { name: 'ID Card', count: 45 },
  { name: 'Headset', count: 10 },
];

export default function AssetAllocation() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Allocated': return { bg: '#ECFDF5', text: '#10B981', border: '#A7F3D0' };
      case 'Pending': return { bg: '#FFFBEB', text: '#F59E0B', border: '#FDE68A' };
      default: return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif', paddingBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Asset Allocation</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Allocate and track assets for new employees</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {kpiData.map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, display: 'flex', gap: '16px', padding: '20px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500', marginBottom: '4px' }}>{kpi.title}</div>
              <div style={{ fontSize: '24px', color: '#1E293B', fontWeight: '700' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search employee..." 
                  style={{ width: '220px', padding: '8px 10px 8px 30px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '13px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
               <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                <Plus size={16} /> Allocate Asset
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Employee</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Department</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Assets Allocated</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Allocated On</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Allocated By</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assetsData.map((row, index) => (
                  <tr key={row.id} style={{ borderBottom: index === assetsData.length - 1 ? 'none' : '1px solid #F8FAFC', transition: 'background 0.2s', ':hover': { background: '#F8FAFC' } }}>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                          {row.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{row.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{row.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.dept}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#2952E3', fontWeight: '500', whiteSpace: 'nowrap' }}>{row.assets}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.date}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.by}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
              Showing 1 to 6 of 120 entries
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
                <ChevronLeft size={16} />
              </button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2952E3', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FFF', fontSize: '13px', fontWeight: '500' }}>
                1
              </button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                2
              </button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                3
              </button>
              <span style={{ margin: '0 4px', color: '#94A3B8' }}>...</span>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                20
              </button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Charts & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Asset Summary */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Asset Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {summaryData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{item.name}</span>
                  <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600' }}>{item.count}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
               <button style={{ background: 'none', border: 'none', color: '#2952E3', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View All Assets</button>
            </div>
          </div>

          {/* Allocation Status Donut Chart */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Asset Allocation Status</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '120px', height: '120px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value" cx="50%" cy="50%" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label value="120" position="center" fill="#1E293B" style={{ fontSize: '24px', fontWeight: '700' }} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '70%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: '#64748B' }}>Total</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginLeft: '16px' }}>
                {pieData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '500' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }}></div>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ fontWeight: '600', color: '#1E293B' }}>{item.value}</span>
                      <span style={{ color: '#94A3B8' }}>({Math.round((item.value/120)*100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
