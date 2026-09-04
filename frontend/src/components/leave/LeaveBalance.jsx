import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { Search, Download, Briefcase, HeartPulse, Award, Clock } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { getAvatarUrl } from '../../lib/utils';

export default function LeaveBalance() {
  const [data, setData] = useState({
    summary: { cl: '0 Days', sl: '0 Days', el: '0 Days', comp: '0 Hours' },
    records: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [monthFilter, setMonthFilter] = useState('August 2026');

  const getAuthUser = () => {
    try {
      const authRaw = localStorage.getItem('hrms_auth');
      if (authRaw) {
        const parsed = JSON.parse(authRaw);
        if (parsed) {
          return {
            id: parsed.user?.id,
            role: parsed.role || parsed.user?.role || localStorage.getItem('userRole') || 'SUPER_ADMIN',
            name: parsed.user?.name || parsed.name || localStorage.getItem('userName') || 'User'
          };
        }
      }
    } catch (e) {}
    return { id: null, role: localStorage.getItem('userRole') || 'SUPER_ADMIN', name: localStorage.getItem('userName') || 'User' };
  };

  const auth = getAuthUser();
  const isEmployee = String(auth.role).toUpperCase().replace(/_/g, ' ') === 'EMPLOYEE';

  const loadBalances = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/leaves/all-balances');
      if (res && res.records) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load leave balances:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBalances();
  }, []);

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
    border: '1px solid #E5E7EB',
  };

  // Filter records
  const filteredRecords = data.records.filter(r => {
    const nameMatch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch = deptFilter === 'All Departments' || r.dept === deptFilter;
    return nameMatch && deptMatch;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      
      {/* Dynamic Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        {[
          { title: 'Casual Leave (CL)', value: data.summary.cl, icon: <Briefcase size={20} color="#3B82F6" />, bg: '#EFF6FF' },
          { title: 'Sick Leave (SL)', value: data.summary.sl, icon: <HeartPulse size={20} color="#10B981" />, bg: '#ECFDF5' },
          { title: 'Earned Leave (EL)', value: data.summary.el, icon: <Award size={20} color="#8B5CF6" />, bg: '#F5F3FF' },
          { title: 'Comp Off', value: data.summary.comp, icon: <Clock size={20} color="#F59E0B" />, bg: '#FFFBEB' }
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
        {!isEmployee && (
          <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <AppDropdown value={monthFilter} options={[{value:'August 2026',label:'August 2026'},{value:'July 2026',label:'July 2026'},{value:'June 2026',label:'June 2026'}]} size="sm" />

              <AppDropdown value={deptFilter} options={[{value:'All Departments',label:'All Departments'},{value:'Human Resources',label:'Human Resources'},{value:'Engineering',label:'Engineering'},{value:'Sales',label:'Sales'},{value:'Marketing',label:'Marketing'}]} size="sm" />

              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search employee..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} 
                />
              </div>
            </div>

            <button style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#2563EB', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Download size={16} /> Export
            </button>
          </div>
        )}

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
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading leave balances...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No leave balances found.</td>
                </tr>
              ) : (
                filteredRecords.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={getAvatarUrl(emp.profile_photo, emp.name, emp.id)} 
                          alt={emp.name} 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{emp.dept}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#10b981', fontWeight: '600', textAlign: 'center' }}>{emp.cl.toFixed(1)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#ef4444', fontWeight: '600', textAlign: 'center' }}>{emp.sl.toFixed(1)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#8b5cf6', fontWeight: '600', textAlign: 'center' }}>{emp.el.toFixed(1)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#f59e0b', fontWeight: '600', textAlign: 'center' }}>{emp.comp.toFixed(2)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#2563eb', fontWeight: '700', textAlign: 'center' }}>{emp.total.toFixed(1)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b' }}>
          Showing {filteredRecords.length} entries
        </div>

      </div>
    </div>
  );
}
