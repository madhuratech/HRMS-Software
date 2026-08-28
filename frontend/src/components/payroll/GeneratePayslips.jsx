import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function GeneratePayslips() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');

  useEffect(() => {
    setLoading(true);
    apiFetch('/payroll/payslips')
      .then(res => {
        if (res && res.success && Array.isArray(res.data)) {
          setEmployees(res.data);
        } else if (Array.isArray(res)) {
          setEmployees(res);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load payslips:', err);
        setLoading(false);
      });
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const q = search.toLowerCase();
    const matchName = !search.trim() || (emp.name && emp.name.toLowerCase().includes(q)) || (emp.id && emp.id.toLowerCase().includes(q));
    const matchDept = deptFilter === 'All Departments' || emp.dept === deptFilter;
    return matchName && matchDept;
  });

  const departments = ['All Departments', ...new Set(employees.map(e => e.dept).filter(Boolean))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0' }}>
      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <div style={{ position: 'relative', width: '180px' }}>
            <select style={{ width: '100%', padding: '10px 32px 10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', appearance: 'none', color: '#334155', backgroundColor: '#FFF', cursor: 'pointer' }}>
              <option>August 2026</option>
              <option>July 2026</option>
              <option>June 2026</option>
            </select>
            <ChevronDown size={16} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative', width: '200px' }}>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 32px 10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', appearance: 'none', color: '#334155', backgroundColor: '#FFF', cursor: 'pointer' }}
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={16} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employee..."
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', color: '#334155' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            Generate
          </button>
          <button style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', color: '#2952E3', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            Bulk Email
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: 0, boxShadow: '0 8px 24px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Employee</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Employee ID</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Department</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Net Pay</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Payment Mode</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Payslip Status</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>Loading payslips...</td></tr>
              )}
              {!loading && filteredEmployees.length === 0 && (
                <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>No payslips available for your authorized scope.</td></tr>
              )}
              {!loading && filteredEmployees.map((emp, index) => (
                <tr key={emp.id} style={{ borderBottom: index === filteredEmployees.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={emp.avatar} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{emp.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#64748B' }}>{emp.id}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{emp.dept}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{emp.net}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{emp.paymentMode}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: '#ECFDF5',
                      color: '#10B981'
                    }}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2952E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={16} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2952E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Download size={16} /></button>
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
          Showing 1 to {filteredEmployees.length} of {filteredEmployees.length} entries
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
            <ChevronLeft size={16} />
          </button>
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2952E3', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FFF', fontSize: '14px', fontWeight: '500' }}>
            1
          </button>
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
