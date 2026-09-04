import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { 
  DollarSign, FileText, Eye, Download, ShieldCheck, 
  Loader2, AlertCircle, Calendar, CheckCircle2, Printer, X 
} from 'lucide-react';
import { apiFetch, getAuthToken } from '../../lib/api';
import { useToast } from '../ui/Toast';

export function MyPayroll() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [userName, setUserName] = useState('');
  const [empId, setEmpId] = useState('');

  // Payslip View Modal
  const [showModal, setShowModal] = useState(false);
  const [activePayslip, setActivePayslip] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem('hrms_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.user && parsed.user.name) setUserName(parsed.user.name);
        if (parsed.user && (parsed.user.emp_id || parsed.user.employee_id)) {
          setEmpId(parsed.user.emp_id || parsed.user.employee_id);
        }
      } catch (e) {}
    }

    const fetchPayrollData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/payroll/my-payroll');
        if (res && res.success && Array.isArray(res.data)) {
          setPayslips(res.data);
        } else if (Array.isArray(res)) {
          setPayslips(res);
        } else {
          setPayslips([]);
        }
      } catch (err) {
        console.error("Failed to load employee payroll records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, []);

  // Format currency
  const fmt = (num) => `₹ ${Number(num || 0).toLocaleString('en-IN')}`;

  // Download PDF helper
  const handleDownload = async (record) => {
    try {
      addToast('Downloading payslip PDF...', 'info');
      const token = getAuthToken();
      const res = await fetch(`/app/payroll/${record.id}/download-pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const code = record.emp_code || `EMP${record.employee_id}`;
      a.download = `Payslip_${code}_${record.month}_${record.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast('Payslip downloaded successfully', 'success');
    } catch (e) {
      addToast('Could not download payslip PDF', 'error');
    }
  };

  const handleView = async (record) => {
    try {
      const res = await apiFetch(`/payroll/${record.id}/payslip`);
      if (res && res.success && res.data) {
        setActivePayslip(res.data);
      } else {
        setActivePayslip(record);
      }
      setShowModal(true);
    } catch (e) {
      setActivePayslip(record);
      setShowModal(true);
    }
  };

  const filtered = selectedMonth === 'All Months' 
    ? payslips 
    : payslips.filter(p => `${p.month} ${p.year}` === selectedMonth || p.month === selectedMonth);

  const monthsList = ['All Months', ...new Set(payslips.map(p => `${p.month} ${p.year}`))];

  const latest = payslips[0];
  const monthlySalary = latest ? Number(latest.net_salary || 0) : 0;
  const grossSalary = latest ? Number(latest.gross_salary || 0) : 0;
  const annualCtc = grossSalary * 12;

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
    border: '1px solid #E2E8F0'
  };

  if (loading) {
    return (
      <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <Loader2 className="animate-spin" size={36} color="#2563EB" />
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Loading your official payroll records...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px -5px rgba(37,99,235,0.25)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>My Salary & Payslips</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#DBEAFE' }}>
            Confidential Payroll Record • {userName || 'Employee'} {empId ? `(${empId})` : ''}
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '8px 16px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={16} /> Verified Corporate Record
        </div>
      </div>

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={cardStyle}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
            Latest Disbursed Net Pay
          </span>
          <strong style={{ fontSize: '24px', fontWeight: '800', color: '#2563EB', display: 'block' }}>
            {monthlySalary > 0 ? fmt(monthlySalary) : 'Pending Generation'}
          </strong>
          <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '6px' }}>
            {latest ? `For ${latest.month} ${latest.year} • ${latest.status}` : 'No payslips generated yet'}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
            Gross Monthly Earnings
          </span>
          <strong style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', display: 'block' }}>
            {grossSalary > 0 ? fmt(grossSalary) : 'Pending Generation'}
          </strong>
          <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600', display: 'block', marginTop: '6px' }}>
            Annualized CTC: {annualCtc > 0 ? fmt(annualCtc) : 'TBD'}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
            Payment Account & Mode
          </span>
          <strong style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', display: 'block' }}>
            {latest ? (latest.payment_mode || 'Direct Bank Transfer') : 'Corporate Payroll Account'}
          </strong>
          <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '6px' }}>
            Disbursed via automated bank transfer
          </span>
        </div>
      </div>

      {/* Payslip History Table */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>Payslip History</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>View and download your monthly salary statements</p>
          </div>
          <div>
            <AppDropdown value={selectedMonth} options={[{value:'m',label:'m'}, ...(monthsList || [])]} size="sm" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9', color: '#64748B' }}>
            <AlertCircle size={28} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '14px', fontWeight: '600' }}>No payslips generated for this period</div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>Once your company HR/Finance team processes payroll for the month, your statement will be available here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Pay Period</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Basic</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>HRA</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Allowances</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Deductions</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Net Salary</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                      {row.month} {row.year}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>{fmt(row.basic)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>{fmt(row.hra)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>{fmt(row.allowances)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#DC2626', fontWeight: '600' }}>- {fmt(row.total_deductions)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '800', color: '#2563EB' }}>{fmt(row.net_salary)}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: row.status === 'Paid' ? '#ECFDF5' : '#EFF6FF',
                        color: row.status === 'Paid' ? '#059669' : '#2563EB',
                        border: row.status === 'Paid' ? '1px solid #A7F3D0' : '1px solid #BFDBFE'
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleView(row)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFF', color: '#2563EB', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          onClick={() => handleDownload(row)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#2563EB', color: '#FFF', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={12} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payslip View Modal */}
      {showModal && activePayslip && (() => {
        const p = activePayslip;
        const company = p.company || {};
        const empCode = p.emp_code || `EMP${p.employee_id}`;

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
            <div style={{ width: '800px', maxWidth: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
              
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>Payslip • {p.month} {p.year}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleDownload(p)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#2563EB', color: '#FFF', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download size={13} /> Download PDF
                  </button>
                  <button onClick={() => setShowModal(false)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={14} color="#64748B" />
                  </button>
                </div>
              </div>

              <div style={{ padding: '28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1E3A8A' }}>{company.company_name || 'Madhura Technologies'}</h2>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>{company.head_office_address || 'Tamil Nadu, India'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>SALARY PAYSLIP</div>
                    <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: '700' }}>{p.month} {p.year}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '10px', fontSize: '12px' }}>
                  <div><span style={{ color: '#64748B' }}>Employee Name:</span> <strong style={{ color: '#1E293B' }}>{p.employee_name}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Employee ID:</span> <strong style={{ color: '#1E293B' }}>{empCode}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Department:</span> <strong style={{ color: '#1E293B' }}>{p.department || 'General'}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Designation:</span> <strong style={{ color: '#1E293B' }}>{p.designation || 'Staff'}</strong></div>
                </div>

                <div style={{ border: '1px solid #CBD5E1', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#1E3A8A', color: '#FFF', fontWeight: '700', fontSize: '12px', padding: '8px 14px' }}>
                    <div>EARNINGS</div>
                    <div>DEDUCTIONS</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '12px' }}>
                    <div style={{ padding: '12px 14px', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Basic:</span> <strong>{fmt(p.basic)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>HRA:</span> <strong>{fmt(p.hra)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Allowances:</span> <strong>{fmt(p.allowances)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bonus:</span> <strong>{fmt(p.bonus)}</strong></div>
                    </div>
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PF (12%):</span> <strong style={{ color: '#DC2626' }}>{fmt(p.pf)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>ESI:</span> <strong style={{ color: '#DC2626' }}>{fmt(p.esi)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax / PT:</span> <strong style={{ color: '#DC2626' }}>{fmt(p.tax)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>LOP:</span> <strong style={{ color: '#DC2626' }}>{fmt(p.lop_amount)}</strong></div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F8FAFC', borderTop: '1px solid #CBD5E1', padding: '10px 14px', fontSize: '12px', fontWeight: '700' }}>
                    <div>Gross: {fmt(p.gross_salary)}</div>
                    <div style={{ color: '#DC2626' }}>Total Deductions: - {fmt(p.total_deductions)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#ECFDF5', borderRadius: '10px', border: '1px solid #86EFAC' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Net Pay Disbursed</div>
                    <div style={{ fontSize: '11px', color: '#15803D' }}>Paid via Bank Transfer</div>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#14532D' }}>{fmt(p.net_salary)}</div>
                </div>
              </div>

              <div style={{ padding: '12px 24px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', color: '#64748B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default MyPayroll;
