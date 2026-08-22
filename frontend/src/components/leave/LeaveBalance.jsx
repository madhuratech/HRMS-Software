import React from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Briefcase, HeartPulse, Award, Clock } from 'lucide-react';

const balanceData = [
  { name: 'Aarav Sharma', dept: 'Design', cl: 6.0, sl: 8.5, el: 10.0, comp: 8.00 },
  { name: 'Priya Nair', dept: 'Design', cl: 7.0, sl: 6.0, el: 9.0, comp: 6.00 },
  { name: 'Rohan Mehta', dept: 'Development', cl: 5.0, sl: 5.0, el: 6.0, comp: 5.00 },
  { name: 'Neha Patel', dept: 'HR', cl: 8.0, sl: 8.5, el: 10.0, comp: 7.15 },
  { name: 'Karan Verma', dept: 'Development', cl: 7.0, sl: 6.0, el: 3.0, comp: 4.30 },
  { name: 'Anjali Desai', dept: 'Marketing', cl: 8.0, sl: 5.5, el: 8.0, comp: 6.00 },
  { name: 'Vikram Singh', dept: 'Sales', cl: 7.0, sl: 5.0, el: 16.0, comp: 5.45 },
  { name: 'Pooja Reddy', dept: 'HR', cl: 9.0, sl: 5.0, el: 13.0, comp: 4.15 },
];

export default function LeaveBalance() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
    border: '1px solid #E5E7EB',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      
      {/* Content */}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        {[
          { title: 'Casual Leave (CL)', value: '184 Days', icon: <Briefcase size={20} color="#3B82F6" />, bg: '#EFF6FF' },
          { title: 'Sick Leave (SL)', value: '142 Days', icon: <HeartPulse size={20} color="#10B981" />, bg: '#ECFDF5' },
          { title: 'Earned Leave (EL)', value: '215 Days', icon: <Award size={20} color="#8B5CF6" />, bg: '#F5F3FF' },
          { title: 'Comp Off', value: '48 Hours', icon: <Clock size={20} color="#F59E0B" />, bg: '#FFFBEB' }
        ].map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>{kpi.title}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{kpi.value}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <select style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569', minWidth: '140px' }}>
              <option>May 2024</option>
              <option>April 2024</option>
            </select>
            <select style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569', minWidth: '160px' }}>
              <option>All Departments</option>
              <option>Design</option>
              <option>Development</option>
            </select>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
              <input type="text" placeholder="Search employee..." style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
            </div>
          </div>
          <button style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#2952E3', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Download size={16} /> Export
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Employee</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Department</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>CL (Days)</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>SL (Days)</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>EL (Days)</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Comp Off (Hrs)</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Total (Days)</th>
              </tr>
            </thead>
            <tbody>
              {balanceData.map((emp, idx) => {
                const total = (emp.cl + emp.sl + emp.el + (emp.comp / 8)).toFixed(1);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=f1f5f9&color=64748b`} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{emp.dept}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#10b981', fontWeight: '600', textAlign: 'center' }}>{emp.cl.toFixed(1)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#ef4444', fontWeight: '600', textAlign: 'center' }}>{emp.sl.toFixed(1)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#8b5cf6', fontWeight: '600', textAlign: 'center' }}>{emp.el.toFixed(1)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600', textAlign: 'center' }}>{emp.comp.toFixed(2)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#2952E3', fontWeight: '700', textAlign: 'center' }}>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Showing 1 to 8 of 45 entries</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button style={{ padding: '6px', border: '1px solid #E5E7EB', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16} color="#64748b" /></button>
            <button style={{ padding: '6px 12px', border: 'none', background: '#2952E3', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>1</button>
            <button style={{ padding: '6px 12px', border: '1px solid #E5E7EB', background: '#fff', color: '#64748b', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>2</button>
            <button style={{ padding: '6px 12px', border: '1px solid #E5E7EB', background: '#fff', color: '#64748b', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>3</button>
            <button style={{ padding: '6px', border: '1px solid #E5E7EB', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16} color="#64748b" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
